import time
import re
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import chromedriver_autoinstaller
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from webdriver_manager.core.os_manager import ChromeType
# from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from urllib.parse import urljoin
from elements.models import NeutronCrossSection, Isotope, Element

BASE_URL = "https://www-nds.iaea.org/ngatlas/"

def find_isotope_in_database(target_text):
    """
    Find the corresponding isotope in the database based on target text.
    Target text format examples: 'H-1', 'U-235', 'Pu-239', 'SC-44-IS=1', '44-'
    """
    try:
        # Parse target text (e.g., 'H-1' -> element='H', mass_number=1)
        if '-' in target_text:
            parts = target_text.split('-')
            element_symbol = parts[0].strip()
            
            # Find the first part that looks like a number
            mass_number = None
            for part in parts[1:]:
                part = part.strip()
                # Skip empty parts
                if not part:
                    continue
                # Try to extract a number from this part
                # Handle various formats: '44', '44-IS=1', 'IS=1', etc.
                if part.isdigit():
                    mass_number = int(part)
                    break
                elif 'IS=' in part:
                    # Extract number before IS=
                    before_is = part.split('IS=')[0].strip()
                    if before_is.isdigit():
                        mass_number = int(before_is)
                        break
                else:
                    # Try to extract digits from the beginning
                    digits = ''
                    for char in part:
                        if char.isdigit():
                            digits += char
                        else:
                            break
                    if digits:
                        mass_number = int(digits)
                        break
            
            if mass_number is None:
                return None
            
            # Normalize element symbol to handle common variations
            # HE -> He, LI -> Li, BE -> Be, etc.
            element_symbol_normalized = element_symbol.title()
            
            # Find the element first - try normalized version, then original, then case-insensitive
            element = Element.objects.filter(symbol=element_symbol_normalized).first()
            if not element:
                element = Element.objects.filter(symbol=element_symbol).first()
            if not element:
                element = Element.objects.filter(symbol__iexact=element_symbol).first()
            
            if element:
                # Find the isotope
                isotope = Isotope.objects.filter(
                    element=element,
                    mass_number=mass_number
                ).first()
                
                if isotope:
                    return isotope
                else:
                    return None
            else:
                return None
        else:
            return None
            
    except (ValueError, AttributeError) as e:
        return None

# setup_driver function moved to Command class

def get_range_links(driver):
    # The main page uses frames, so we need to navigate to the contents frame
    driver.get(BASE_URL)
    time.sleep(2)
    
    # Try to navigate to the contents frame
    contents_url = BASE_URL + "frconten.htm"
    driver.get(contents_url)
    time.sleep(2)
    
    links = driver.find_elements(By.TAG_NAME, "a")
    range_links = []
    
    # Look for links that match the pattern of range files
    range_patterns = [
        "h1toni61.htm",
        "ni62tobr81.htm", 
        "br82tomo98.htm",
        "mo99tocd116.htm",
        "in111tote125.htm",
        "te125istoba135is.htm",
        "ba136toeu153.htm",
        "eu154tolu175.htm",
        "lu176tohg198.htm",
        "hg199tocm248.htm"
    ]
    
    for link in links:
        href = link.get_attribute("href")
        if href:
            # Check if this is one of the range files
            filename = href.split("/")[-1].lower()
            if filename in [p.lower() for p in range_patterns]:
                full_url = href if href.startswith("http") else BASE_URL + filename
                range_links.append(full_url)
                
    # If no specific patterns found, fall back to original logic
    if not range_links:
        for link in links:
            href = link.get_attribute("href")
            if href and href.endswith(".htm") and ("to" in href.lower() or "is" in href.lower()):
                full_url = href if href.startswith("http") else BASE_URL + href.split("/")[-1]
                range_links.append(full_url)
    
    return range_links

def get_isotopes_from_range(driver, url):
    driver.get(url)
    time.sleep(1)
    isotopes = []
    
    # Get all links that might be isotope links
    links = driver.find_elements(By.TAG_NAME, "a")
    
    for link in links:
        target = link.text.strip()
        isotope_url = link.get_attribute("href")
        
        # Skip if no target text or URL
        if not target or not isotope_url or not isotope_url.endswith(".htm"):
            continue
            
        # Skip navigation links and non-isotope links
        if target.lower() in ['h-1', 'ni-61', 'ni-62', 'br-81', 'br-82', 'mo-98'] and "to" in target.lower():
            continue
            
        # Look for isotope pattern (element-number or element-number-IS=X)
        if not any(char.isdigit() for char in target):
            continue
            
        # Try to extract reaction and origin from surrounding text
        reaction = "N,G"  # Default reaction type based on the data shown
        origin = ""
        
        try:
            # Look for the parent element containing reaction and origin info
            parent = link.find_element(By.XPATH, "./..")
            parent_text = parent.text.strip()
            
            # Parse the line format: "Number Target Reaction Origin"
            # Example: "1    H-1           N,G     JEF-2.2"
            lines = parent_text.split('\n')
            for line in lines:
                if target in line:
                    parts = line.split()
                    if len(parts) >= 4:
                        # Find target position and extract reaction/origin
                        try:
                            target_idx = next(i for i, part in enumerate(parts) if target in part)
                            if target_idx + 2 < len(parts):
                                reaction = parts[target_idx + 1]
                                origin = ' '.join(parts[target_idx + 2:])
                        except:
                            pass
                    break
        except:
            pass
        
        # Construct full URL if relative
        if not isotope_url.startswith("http"):
            isotope_url = BASE_URL + isotope_url.split("/")[-1]

        isotopes.append({
            "range_url": url,
            "target": target,
            "reaction": reaction,
            "origin": origin,
            "isotope_url": isotope_url
        })
        
    return isotopes

def parse_isotope_data(driver, isotope, max_rows=None):
    url = isotope["isotope_url"]
    driver.get(url)
    time.sleep(1)

    # Look for data in <pre> tags first (where the actual cross-section data is)
    pre_elements = driver.find_elements(By.TAG_NAME, "pre")
    text_block = ""
    
    if pre_elements:
        # Use the first <pre> element which contains the cross-section data
        text_block = pre_elements[0].text
    else:
        # Fallback to <font> tags if no <pre> found
        fonts = driver.find_elements(By.TAG_NAME, "font")
        text_block = " ".join([f.text for f in fonts])

    # Regex para números en notación científica
    numbers = re.findall(r"[-+]?\d+\.\d+E[+-]?\d+", text_block)
    numbers = [float(n) for n in numbers]

    data = []
    for i in range(0, len(numbers), 2):
        try:
            energy = numbers[i]
            xs = numbers[i+1]
            data.append({
                "range_url": isotope["range_url"],
                "target": isotope["target"],
                "reaction": isotope["reaction"],
                "origin": isotope["origin"],
                "energy": energy,
                "cross_section": xs,
                "isotope_url": url
            })
        except IndexError:
            break

    # Select up to 10 most important cross sections (e.g., highest cross_section values)
    if data:
        # Sort by cross_section descending, then by energy ascending (for ties)
        data = sorted(data, key=lambda d: (-abs(d["cross_section"]), d["energy"]))
        data = data[:10]
        # Optionally, sort back by energy for easier plotting/reading
        data = sorted(data, key=lambda d: d["energy"])

    return data

class Command(BaseCommand):
    help = 'Scrape neutron cross-section data from IAEA database and save to Django models'

    def add_arguments(self, parser):
        parser.add_argument(
            '--max-rows',
            type=int,
            default=None,
            help='Limit number of rows per isotope (for testing purposes)'
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Clear existing neutron cross-section data before scraping'
        )
        parser.add_argument(
            '--check-isotopes',
            action='store_true',
            help='Check which isotopes exist in database before scraping'
        )
        parser.add_argument(
            '--headless',
            action='store_true',
            default=True,
            help='Run browser in headless mode (default: True)'
        )
        parser.add_argument(
            '--browser',
            choices=['chrome', 'firefox'],
            default='chrome',
            help='Browser to use for scraping (default: chrome)'
        )
        parser.add_argument("--single-process")
        parser.add_argument("--disable-software-rasterizer")

    def handle(self, *args, **options):
        max_rows = options.get('max_rows')
        clear_existing = options.get('clear_existing')
        check_isotopes = options.get('check_isotopes')
        headless = options.get('headless')
        browser = options.get('browser')

        if check_isotopes:
            self.stdout.write(self.style.SUCCESS('Checking isotopes in database...'))
            total_isotopes = Isotope.objects.count()
            total_elements = Element.objects.count()
            self.stdout.write(f'Total elements in database: {total_elements}')
            self.stdout.write(f'Total isotopes in database: {total_isotopes}')
            
            if total_isotopes == 0:
                self.stdout.write(
                    self.style.WARNING('⚠️  No isotopes found in database! Please run the getElementsMendeleev command first.')
                )
                return
            
            # Show some examples
            sample_isotopes = Isotope.objects.select_related('element')[:10]
            self.stdout.write('Sample isotopes in database:')
            for iso in sample_isotopes:
                self.stdout.write(f'  {iso.element.symbol}-{iso.mass_number} ({iso.element.name})')
            
            if total_isotopes > 10:
                self.stdout.write(f'  ... and {total_isotopes - 10} more')
            
            self.stdout.write('')
            return

        if clear_existing:
            self.stdout.write(
                self.style.WARNING('Clearing existing neutron cross-section data...')
            )
            NeutronCrossSection.objects.all().delete()
            self.stdout.write(
                self.style.SUCCESS('Existing data cleared.')
            )

        driver = self.setup_driver(headless=headless, browser=browser)
        total_records = 0
        total_isotopes_processed = 0
        total_isotopes_found = 0

        try:
            range_links = get_range_links(driver)
            self.stdout.write(
                self.style.SUCCESS(f'Found {len(range_links)} ranges to process.')
            )
            
            # Debug output
            if range_links:
                self.stdout.write('Range URLs found:')
                for i, url in enumerate(range_links[:3], 1):  # Show first 3
                    self.stdout.write(f'  {i}. {url}')
                if len(range_links) > 3:
                    self.stdout.write(f'  ... and {len(range_links) - 3} more')
            else:
                self.stdout.write(self.style.WARNING('No range URLs found. Checking page source...'))
                # Debug: check what's actually on the page
                page_source = driver.page_source[:1500]  # First 1500 chars
                self.stdout.write(f'Page source preview: {page_source}')
                
                # Also check all links found on the page
                try:
                    all_links = driver.find_elements(By.TAG_NAME, "a")
                    self.stdout.write(f'Total links found on page: {len(all_links)}')
                    if all_links:
                        self.stdout.write('First few links:')
                        for i, link in enumerate(all_links[:5]):
                            href = link.get_attribute("href")
                            text = link.text.strip()[:50]  # First 50 chars
                            self.stdout.write(f'  {i+1}. {text} -> {href}')
                except Exception as e:
                    self.stdout.write(f'Error getting links: {e}')

            for range_url in range_links:
                self.stdout.write(f'Processing range: {range_url}')
                isotopes = get_isotopes_from_range(driver, range_url)

                for isotope in isotopes:
                    total_isotopes_processed += 1
                    self.stdout.write(f'  Processing isotope: {isotope["target"]} -> {isotope["isotope_url"]}')
                    
                    # Debug: show what we're looking for
                    if '-' in isotope["target"]:
                        parts = isotope["target"].split('-')
                        element_symbol = parts[0].strip()
                        
                        # Find the first part that looks like a number
                        mass_number = None
                        for part in parts[1:]:
                            part = part.strip()
                            # Skip empty parts
                            if not part:
                                continue
                            # Try to extract a number from this part
                            if part.isdigit():
                                mass_number = int(part)
                                break
                            elif 'IS=' in part:
                                # Extract number before IS=
                                before_is = part.split('IS=')[0].strip()
                                if before_is.isdigit():
                                    mass_number = int(before_is)
                                    break
                            else:
                                # Try to extract digits from the beginning
                                digits = ''
                                for char in part:
                                    if char.isdigit():
                                        digits += char
                                    else:
                                        break
                                if digits:
                                    mass_number = int(digits)
                                    break
                        
                        if mass_number is not None:
                            self.stdout.write(f'    Looking for: Element={element_symbol}, Mass={mass_number}')
                            
                            # Check if element exists
                            element = Element.objects.filter(symbol__iexact=element_symbol).first()
                            if element:
                                self.stdout.write(f'      Element found: {element.symbol} ({element.name})')
                                # Check if isotope exists
                                isotope_obj = Isotope.objects.filter(element=element, mass_number=mass_number).first()
                                if isotope_obj:
                                    self.stdout.write(f'      Isotope found: {isotope_obj}')
                                else:
                                    self.stdout.write(f'      Isotope NOT found for mass {mass_number}')
                            else:
                                self.stdout.write(f'      Element NOT found: {element_symbol}')
                        else:
                            self.stdout.write(f'    Could not parse mass number from: {isotope["target"]}')
                    
                    iso_data = parse_isotope_data(driver, isotope, max_rows=max_rows)
                    self.stdout.write(f'    Cross-section data points found: {len(iso_data) if iso_data else 0}')
                    
                    # Save data to Django models in batches
                    if iso_data:
                        # Find the corresponding isotope in the database
                        db_isotope = find_isotope_in_database(isotope["target"])
                        
                        if db_isotope:
                            total_isotopes_found += 1
                            records_to_create = []
                            for data_point in iso_data:
                                records_to_create.append(
                                    NeutronCrossSection(
                                        isotope=db_isotope,  # Link to the isotope
                                        target=data_point['target'],
                                        reaction=data_point['reaction'],
                                        origin=data_point['origin'],
                                        energy=data_point['energy'],
                                        cross_section=data_point['cross_section'],
                                        range_url=data_point['range_url'],
                                        isotope_url=data_point['isotope_url']
                                    )
                                )
                            
                            # Bulk create for better performance
                            with transaction.atomic():
                                NeutronCrossSection.objects.bulk_create(
                                    records_to_create,
                                    ignore_conflicts=True  # Skip duplicates
                                )
                            
                            total_records += len(records_to_create)
                            self.stdout.write(f'    Saved {len(records_to_create)} records linked to isotope {db_isotope}')
                        else:
                            self.stdout.write(
                                self.style.WARNING(f'    Skipping {len(iso_data)} records - isotope {isotope["target"]} not found in database')
                            )
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'    No cross-section data found for {isotope["target"]}')
                        )

        except Exception as e:
            raise CommandError(f'Error during scraping: {str(e)}')
        finally:
            driver.quit()

        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Successfully scraped and saved {total_records} neutron cross-section records to database.'
            )
        )
        
        # Show summary of linked isotopes
        if total_records > 0:
            linked_isotopes = NeutronCrossSection.objects.values('isotope').distinct().count()
            self.stdout.write(
                self.style.SUCCESS(
                    f'📊 Records linked to {linked_isotopes} different isotopes.'
                )
            )
        
        # Show processing summary
        self.stdout.write(
            self.style.SUCCESS(
                f'📋 Processing Summary:'
            )
        )
        self.stdout.write(f'  Total isotopes processed: {total_isotopes_processed}')
        self.stdout.write(f'  Isotopes found in database: {total_isotopes_found}')
        self.stdout.write(f'  Total records saved: {total_records}')
        self.stdout.write(f'  Isotopes with data: {linked_isotopes}')

    def setup_driver(self, headless=True, browser='chrome'):
        """Setup WebDriver with appropriate options"""
        if browser == 'firefox':
            return self._setup_firefox_driver(headless)
        else:
            return self._setup_chrome_driver(headless)
    
    def _setup_chrome_driver(self, headless=True):
        """Setup Chrome WebDriver with appropriate options, using chromedriver_autoinstaller for universal compatibility"""
        options = Options()
        if headless:
            options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-extensions")
        options.add_argument("--remote-debugging-port=9222")

        # Try different Chrome binary locations for WSL/Linux
        chrome_paths = [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
            "/snap/bin/chromium"
        ]

        chrome_binary = None
        for path in chrome_paths:
            try:
                import os
                if os.path.exists(path):
                    chrome_binary = path
                    break
            except:
                continue

        if chrome_binary:
            options.binary_location = chrome_binary
            self.stdout.write(f'Using Chrome binary: {chrome_binary}')

        try:
            self.stdout.write('Trying Chrome with chromedriver_autoinstaller...')
            chromedriver_autoinstaller.install()
            driver = webdriver.Chrome(options=options)
            self.stdout.write(self.style.SUCCESS('Chrome setup successful!'))
            return driver
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'Chrome setup failed: {str(e)}')
            )

        # If Chrome attempt failed, try Firefox as fallback
        self.stdout.write(
            self.style.WARNING('All Chrome setup attempts failed. Trying Firefox as fallback...')
        )
        return self._setup_firefox_driver(headless)
    
    def _setup_firefox_driver(self, headless=True):
        """Setup Firefox WebDriver as fallback"""
        options = FirefoxOptions()
        if headless:
            options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        try:
            self.stdout.write('Setting up Firefox driver...')
            gecko_path = GeckoDriverManager().install()
            self.stdout.write(f'Using GeckoDriver at: {gecko_path}')
            driver = webdriver.Firefox(
                service=FirefoxService(gecko_path),
                options=options
            )
            self.stdout.write(self.style.SUCCESS('Firefox setup successful!'))
            return driver
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Firefox setup failed: {str(e)}'))
            self.stdout.write(self.style.ERROR('''\nFailed to setup both Chrome and Firefox drivers.\n\nTroubleshooting steps:\n- Make sure you have Firefox installed (try: firefox --version)\n- Make sure you have geckodriver installed (try: geckodriver --version)\n- If using Snap Firefox, consider switching to the .deb version for better Selenium compatibility.\n- Check for missing libraries: sudo apt install -y libgtk-3-0 libdbus-glib-1-2 libxt6 libx11-xcb1 libxcb-shm0 libxcb1 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libasound2 libpango-1.0-0 libpangocairo-1.0-0 libatk1.0-0 libgdk-pixbuf2.0-0 libxinerama1 libnss3 libxss1 libxext6 libxrender1 libxcb1 libxcb-glx0 libxcb-keysyms1 libxcb-image0 libxcb-shm0 libxcb-icccm4 libxcb-sync1 libxcb-xfixes0 libxcb-shape0 libxcb-randr0 libxcb-render-util0 libxcb-xinerama0\n- Try running: firefox --headless about:blank\n- Try running: geckodriver --version\n\nIf you still have issues, please provide the full error message above to your developer or system administrator.'''))
            raise CommandError(f'Firefox setup failed: {str(e)}')


# Keep the original functions for backward compatibility
def main():
    """Legacy main function - use Django command instead"""
    print("⚠️  This script should now be run as a Django management command:")
    print("   python manage.py getNeutronCrossSection")
    print("   Use --help for available options")

if __name__ == "__main__":
    main()
