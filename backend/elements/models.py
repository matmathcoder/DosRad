from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Element(models.Model):
    """Chemical elements with atomic properties"""
    atomic_number = models.PositiveIntegerField(unique=True)
    symbol = models.CharField(max_length=4, unique=True)
    name = models.CharField(max_length=64)
    atomic_mass = models.FloatField(null=True, blank=True)
    
    # Additional properties for radiation simulation
    density = models.FloatField(null=True, blank=True, help_text="Density in g/cm³")
    melting_point = models.FloatField(null=True, blank=True, help_text="Melting point in K")
    boiling_point = models.FloatField(null=True, blank=True, help_text="Boiling point in K")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} ({self.name})"

    class Meta:
        ordering = ['atomic_number']


class Isotope(models.Model):
    """Nuclear isotopes with decay properties"""
    element = models.ForeignKey(Element, on_delete=models.CASCADE, related_name="isotopes")
    mass_number = models.PositiveIntegerField()
    half_life = models.CharField(max_length=128, null=True, blank=True)
    decay_mode = models.CharField(max_length=64, blank=True, default="")
    decay_product = models.CharField(max_length=64, null=True, blank=True)
    is_stable = models.BooleanField(default=False)
    
    # Neutron and proton numbers for easier calculations
    neutron_number = models.PositiveIntegerField(null=True, blank=True)
    
    # Additional properties for radiation simulation
    abundance = models.FloatField(null=True, blank=True, help_text="Natural abundance as percentage")
    spin_parity = models.CharField(max_length=16, blank=True, default="", help_text="Nuclear spin and parity")
    magnetic_moment = models.FloatField(null=True, blank=True, help_text="Nuclear magnetic moment in μN")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ("element", "mass_number")
        ordering = ['element__atomic_number', 'mass_number']

    def __str__(self):
        return f"{self.element.symbol}-{self.mass_number}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate neutron number
        if self.element_id:
            self.neutron_number = self.mass_number - self.element.atomic_number
        super().save(*args, **kwargs)


class DecayPath(models.Model):
    """Represents a decay pathway from parent to daughter isotope"""
    DECAY_TYPES = [
        ('alpha', 'Alpha decay (α)'),
        ('beta_minus', 'Beta minus decay (β-)'),
        ('beta_plus', 'Beta plus decay (β+)'),
        ('electron_capture', 'Electron capture (EC)'),
        ('spontaneous_fission', 'Spontaneous fission (SF)'),
        ('proton_emission', 'Proton emission (p)'),
        ('neutron_emission', 'Neutron emission (n)'),
        ('gamma', 'Gamma decay (γ)'),
        ('internal_transition', 'Internal transition (IT)'),
    ]
    
    parent_isotope = models.ForeignKey(
        Isotope, 
        on_delete=models.CASCADE, 
        related_name="decay_children"
    )
    daughter_isotope = models.ForeignKey(
        Isotope, 
        on_delete=models.CASCADE, 
        related_name="decay_parents"
    )
    decay_type = models.CharField(max_length=32, choices=DECAY_TYPES)
    branching_ratio = models.FloatField(default=1.0, help_text="Fraction of decays via this path")
    q_value = models.FloatField(null=True, blank=True, help_text="Energy released in MeV")
    
    # Additional properties
    half_life = models.CharField(max_length=128, null=True, blank=True, help_text="Half-life for this specific decay path")
    energy_released = models.FloatField(null=True, blank=True, help_text="Energy released in MeV")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ("parent_isotope", "daughter_isotope", "decay_type")
        ordering = ['parent_isotope__element__atomic_number', 'parent_isotope__mass_number']
    
    def __str__(self):
        return f"{self.parent_isotope} → {self.daughter_isotope} ({self.decay_type}, {self.branching_ratio:.2%})"


class NeutronReaction(models.Model):
    """Represents neutron-induced nuclear reactions"""
    REACTION_TYPES = [
        ('n_gamma', 'Neutron capture (n,γ)'),
        ('n_p', 'Neutron-proton (n,p)'),
        ('n_alpha', 'Neutron-alpha (n,α)'),
        ('n_2n', 'Neutron-2neutron (n,2n)'),
        ('n_f', 'Neutron-induced fission (n,f)'),
        ('n_d', 'Neutron-deuteron (n,d)'),
        ('n_t', 'Neutron-triton (n,t)'),
        ('n_3n', 'Neutron-3neutron (n,3n)'),
    ]
    
    target_isotope = models.ForeignKey(
        Isotope, 
        on_delete=models.CASCADE, 
        related_name="neutron_reactions_as_target"
    )
    product_isotope = models.ForeignKey(
        Isotope, 
        on_delete=models.CASCADE, 
        related_name="neutron_reactions_as_product",
        null=True, 
        blank=True
    )
    reaction_type = models.CharField(max_length=16, choices=REACTION_TYPES)
    threshold_energy = models.FloatField(default=0.0, help_text="Minimum neutron energy in eV")
    q_value = models.FloatField(null=True, blank=True, help_text="Energy released in MeV")
    
    # Additional properties
    resonance_energy = models.FloatField(null=True, blank=True, help_text="Resonance energy in eV")
    resonance_width = models.FloatField(null=True, blank=True, help_text="Resonance width in eV")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ("target_isotope", "product_isotope", "reaction_type")
        ordering = ['target_isotope__element__atomic_number', 'target_isotope__mass_number']
    
    def __str__(self):
        product_str = str(self.product_isotope) if self.product_isotope else "fragments"
        return f"{self.target_isotope} + n → {product_str} ({self.reaction_type})"


class NeutronCrossSection(models.Model):
    """Neutron cross section data for isotopes"""
    isotope = models.ForeignKey(Isotope, on_delete=models.CASCADE, related_name="cross_sections")
    target = models.CharField(max_length=32, help_text="Target nucleus")
    reaction = models.CharField(max_length=32, help_text="Reaction type")
    origin = models.CharField(max_length=64, blank=True, default="", help_text="Data source")
    energy = models.FloatField(help_text="Neutron energy in eV")
    cross_section = models.FloatField(help_text="Cross section in barns")
    uncertainty = models.FloatField(null=True, blank=True, help_text="Uncertainty in cross section")
    range_url = models.URLField(max_length=256, blank=True, default="", help_text="URL to energy range data")
    isotope_url = models.URLField(max_length=256, blank=True, default="", help_text="URL to isotope data")
    
    # Link to neutron reaction if available
    neutron_reaction = models.ForeignKey(
        NeutronReaction, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name="cross_section_data"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['isotope__element__atomic_number', 'isotope__mass_number', 'energy']
        indexes = [
            models.Index(fields=['isotope', 'energy']),
            models.Index(fields=['reaction', 'energy']),
        ]

    def __str__(self):
        return f"{self.isotope} | {self.energy} eV | {self.cross_section} b"


class GammaSpectrum(models.Model):
    """Gamma ray spectra for isotopes"""
    isotope = models.ForeignKey(Isotope, on_delete=models.CASCADE, related_name="gamma_spectra")
    energy = models.FloatField(help_text="Gamma energy in keV")
    intensity = models.FloatField(help_text="Relative intensity")
    multipolarity = models.CharField(max_length=8, blank=True, default="", help_text="Gamma multipolarity")
    origin = models.CharField(max_length=64, blank=True, default="", help_text="Data source")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['isotope__element__atomic_number', 'isotope__mass_number', 'energy']
        unique_together = ("isotope", "energy")
        indexes = [
            models.Index(fields=['isotope', 'energy']),
        ]

    def __str__(self):
        return f"{self.isotope} | {self.energy} keV | {self.intensity}%"


class ElementComposition(models.Model):
    """Element compositions for materials in Mercurad projects"""
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='element_compositions')
    name = models.CharField(max_length=255, help_text="Composition name")
    description = models.TextField(blank=True, help_text="Composition description")
    
    # Physical properties
    density = models.FloatField(help_text="Density in g/cm³")
    color = models.CharField(max_length=7, default='#888888', help_text="Display color")
    
    # Element composition (JSON field for flexibility)
    elements = models.JSONField(default=list, help_text="List of {element_id, percentage} objects")
    
    # Additional properties
    molecular_weight = models.FloatField(null=True, blank=True, help_text="Molecular weight in g/mol")
    phase = models.CharField(max_length=32, blank=True, default="solid", help_text="Phase (solid, liquid, gas)")
    temperature = models.FloatField(null=True, blank=True, help_text="Temperature in K")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ("project", "name")
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"


class IsotopeSource(models.Model):
    """Isotope sources for radiation simulation in Mercurad projects"""
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='isotope_sources')
    name = models.CharField(max_length=255, help_text="Source name")
    description = models.TextField(blank=True, help_text="Source description")
    
    # Source properties
    isotope = models.ForeignKey(Isotope, on_delete=models.CASCADE, related_name="sources")
    activity = models.FloatField(help_text="Activity in Bq")
    mass = models.FloatField(null=True, blank=True, help_text="Mass in g")
    volume = models.FloatField(null=True, blank=True, help_text="Volume in cm³")
    
    # Geometry reference
    geometry = models.ForeignKey('projects.Geometry', on_delete=models.CASCADE, null=True, blank=True, related_name="isotope_sources")
    
    # Additional properties
    source_type = models.CharField(max_length=32, default="point", help_text="Source type (point, volume, surface)")
    energy_spectrum = models.JSONField(default=list, help_text="Energy spectrum data")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ("project", "name")
    
    def __str__(self):
        return f"{self.name} ({self.isotope}) - {self.project.name}"