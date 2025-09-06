from typing import Optional, Dict

from django.core.management.base import BaseCommand
from django.db import transaction
from mendeleev import element as m_element

from ...models import Element, Isotope


class Command(BaseCommand):
    help = "Import elements and isotopes from mendeleev"

    def add_arguments(self, parser):
        parser.add_argument("--max-z", type=int, default=118)

    @transaction.atomic
    def handle(self, *args, **options):
        max_z = options["max_z"]

        for z in range(1, max_z + 1):
            el = m_element(z)

            element_obj, _ = Element.objects.update_or_create(
                atomic_number=el.atomic_number,
                defaults={
                    "symbol": el.symbol,
                    "name": el.name,
                    "atomic_mass": getattr(el, "atomic_weight", None),
                },
            )

            # el.isotopes: list of isotope objects
            isotopes = getattr(el, "isotopes", [])
            for iso in isotopes:
                # Get the primary decay mode if available
                decay_mode = None
                decay_modes = getattr(iso, "decay_modes", None)
                if decay_modes:
                    if isinstance(decay_modes, dict):
                        # Get the mode with highest probability
                        if decay_modes:
                            decay_mode = max(decay_modes.keys(), key=lambda k: decay_modes[k] or 0)
                    elif hasattr(decay_modes, '__iter__'):
                        try:
                            # Try to get the first decay mode
                            first_mode = next(iter(decay_modes))
                            if hasattr(first_mode, 'mode'):
                                decay_mode = getattr(first_mode, 'mode')
                            elif hasattr(first_mode, 'name'):
                                decay_mode = getattr(first_mode, 'name')
                            elif hasattr(first_mode, 'decay'):
                                decay_mode = getattr(first_mode, 'decay')
                            elif isinstance(first_mode, (list, tuple)) and len(first_mode) > 0:
                                decay_mode = str(first_mode[0])
                        except (StopIteration, TypeError):
                            pass

                isotope_obj, _ = Isotope.objects.update_or_create(
                    element=element_obj,
                    mass_number=iso.mass_number,
                    defaults={
                        "half_life": getattr(iso, "half_life", None),
                        "decay_mode": str(decay_mode) if decay_mode else "",
                        "decay_product": None,  # We don't have daughter element info from mendeleev
                    },
                )

        self.stdout.write(self.style.SUCCESS("Mendeleev import completed."))


