// Comprehensive language dictionaries for Mercurad Interface
export const translations = {
  en: {
    // Navigation & Menus
    file: "File",
    edit: "Edit", 
    inspector: "Inspector",
    scene: "Scene",
    view: "View",
    help: "Help",
    
    // File Menu
    createScene: "Create Scene",
    save: "Save",
    saveAs: "Save as...",
    print: "Print", 
    exportImage: "Export (Image)",
    quitMercurad: "Quit Mercurad",
    
    // Edit Menu
    newVolume: "New Volume",
    selectVolume: "Select Volume", 
    insert: "Insert",
    compoundVolume: "Compound Volume",
    sensor: "Sensor",
    remove: "Remove",
    
    // Inspector Menu
    geometry: "Geometry",
    compositions: "Compositions",
    sources: "Sources",
    calculationResults: "Calculation Results",
    nomConfig: "Nom Config", 
    simple: "Simple",
    complete: "Complete",
    minConfig: "Min Config",
    maxConfig: "Max Config",
    
    // Scene Menu
    generateScene: "Generate Scene...",
    startComputation: "Start Computation",
    
    // View Menu
    mesh: "Mesh",
    cutPlane: "Cut Plane",
    hideSolidAngleLines: "Hide Solid Angle Lines",
    addSolidAngleLines: "Add Solid Angle Lines...",
    normalView: "Normal View",
    
    // Axis Controls
    axis: "Axis",
    
    // View Mode Controls
    solid: "Solid",
    wireframe: "Wireframe", 
    transparent: "Transparent",
    points: "Points",
    
    // Material Mode Controls
    material: "Material",
    solidMaterial: "Solid Material",
    wireframeMaterial: "Wireframe Material", 
    transparentMaterial: "Transparent Material",
    pointsMaterial: "Points Material",
    
    // View Controls
    solidView: "Solid View",
    wireframeView: "Wireframe View",
    pointsView: "Points View",
    
    // Volume Form
    volumeName: "Volume Name",
    enterVolumeName: "Enter volume name",
    volumeType: "Volume Type",
    liquid: "Liquid",
    gas: "Gas", 
    compound: "Compound",
    composition: "Composition",
    materialComposition: "Material Composition",
    realDensity: "Real Density (g/cm³)",
    tolerance: "Tolerance",
    source: "Source",
    sourceIdentifier: "Source identifier", 
    calculation: "Calculation",
    byLines: "By Lines",
    byGroups: "By Groups",
    gammaSelectionMode: "Gamma Selection Mode",
    automatic: "Automatic",
    manual: "Manual",
    custom: "Custom",
    spectrum: "Spectrum",
    spectrumConfiguration: "Spectrum configuration",
    reset: "Reset", 
    cancel: "Cancel",
    saveVolume: "Save Volume",
    
    // Geometry Selector
    geometrySelector: "Geometry Selector",
    cube: "Cube",
    sphere: "Sphere", 
    cylinder: "Cylinder",
    cone: "Cone",
    
    // Tools & Actions
    select: "Select",
    move: "Move",
    rotate: "Rotate", 
    delete: "Delete",
    frame: "Frame",
    home: "Home",
    target: "Target",
    pan: "Pan",
    hand: "Hand",
    
    // Tool Descriptions
    selectTool: "Select and manipulate objects",
    moveTool: "Move/rotate objects (Ctrl+Alt for rotation)",
    targetTool: "Click to zoom to object",
    addHomeTool: "Save current camera view as home",
    homeTool: "Return to saved home view", 
    viewTool: "Frame all objects in view",
    cameraTool: "Toggle perspective/orthographic camera",
    
    // Window Controls
    minimize: "Minimize",
    maximize: "Maximize",
    restore: "Restore",
    close: "Close",
    
    // Zoom Controls
    zoomIn: "Zoom In", 
    zoomOut: "Zoom Out",
    resetZoom: "Reset Zoom",
    zoom: "Zoom",
    
    // Language & Units
    language: "Language",
    units: "Units", 
    millimeters: "Millimeters",
    centimeters: "Centimeters",
    meters: "Meters",
    inches: "Inches",
    feet: "Feet",
    
    // Scene Modes
    nominalScene: "Nominal Scene",
    expertScene: "Expert Scene", 
    expertMode: "Expert Mode",
    enabled: "Enabled",
    disabled: "Disabled",
    
    // Rotation Controls
    sceneRotation: "Scene Rotation",
    horizontal: "Horizontal",
    vertical: "Vertical",
    
    // Help & Shortcuts
    keyboardShortcuts: "Keyboard Shortcuts",
    objectManipulation: "Object Manipulation",
    clickObject: "Click object",
    selectObject: "Select object",
    dragGizmo: "Drag gizmo",
    moveObject: "Move object", 
    rotateObject: "Rotate object (in Move mode)",
    toggleMoveMode: "Toggle Move mode",
    deleteSelectedObject: "Delete selected object",
    
    // Keyboard Movement
    keyboardMovement: "Keyboard Movement",
    moveForward: "Move forward (Z-axis)",
    moveBackward: "Move backward (Z-axis)",
    moveLeft: "Move left (X-axis)", 
    moveRight: "Move right (X-axis)",
    moveUp: "Move up (Y-axis)",
    moveDown: "Move down (Y-axis)",
    
    // Camera Controls
    cameraControls: "Camera Controls",
    orbitCamera: "Orbit camera",
    mouseDrag: "Mouse Drag",
    mouseWheel: "Mouse Wheel",
    zoomInOut: "Zoom in/out",
    saveHomeView: "Save Home view",
    goToHomeView: "Go to Home view", 
    frameAllObjects: "Frame all objects",
    frameSelectedObject: "Frame selected object",
    togglePerspectiveOrthographic: "Toggle perspective/orthographic",
    
    // General Controls
    general: "General",
    deselectObject: "Deselect object",
    toggleHelp: "Toggle this help",
    resetToolToSelect: "Reset tool to Select",
    
    // Contextual Help
    getStarted: "Get Started",
    useGeometrySelector: "Use the Geometry Selector (top-left) to add objects to the scene",
    targetMode: "Target Mode", 
    clickAnyObjectToZoom: "Click any object to zoom and focus on it",
    selectAnObject: "Select an Object",
    clickOnAnyObject: "Click on any object to select and manipulate it",
    moveModeActive: "Move Mode Active",
    dragGizmoToMove: "Drag the gizmo to move • Hold Ctrl to rotate",
    objectSelected: "Object Selected",
    useArrowKeysToMove: "Use arrow keys to move • Drag gizmo for precision • Ctrl+X to delete",
    
    // Status Messages
    sceneRestored: "Scene restored from localStorage",
    sceneSaved: "Scene saved to localStorage", 
    objectDeleted: "Object deleted",
    homeViewSaved: "Home view saved",
    noHomeViewSaved: "No home view saved",
    switchedToRotateMode: "Switched to rotate mode (Ctrl+Alt)",
    switchedBackToTranslateMode: "Switched back to translate mode",
    
    // Collision Messages
    hardCollision: "HARD",
    mediumCollision: "MEDIUM",
    softCollision: "SOFT",
    collisionBetween: "collision between",
    intensity: "intensity",
    
    // Scene States
    viewModeChangedTo: "View mode changed to",
    materialModeChangedTo: "Material mode changed to", 
    axisChangedTo: "Axis changed to",
    zoomSetTo: "Zoom set to",
    sceneRotationSetTo: "Scene rotation set to",
    cameraSetToViewAlong: "Camera set to view along",
    
    // Countries & Languages
    english: "English",
    spanish: "Español", 
    french: "Français",
    german: "Deutsch",
    italian: "Italiano",
    portuguese: "Português"
  },
  
  es: {
    // Navigation & Menus
    file: "Archivo",
    edit: "Editar",
    inspector: "Inspector",
    scene: "Escena",
    view: "Vista",
    help: "Ayuda",
    
    // File Menu
    createScene: "Crear Escena",
    save: "Guardar",
    saveAs: "Guardar como...",
    print: "Imprimir",
    exportImage: "Exportar (Imagen)",
    quitMercurad: "Salir de Mercurad",
    
    // Edit Menu
    newVolume: "Nuevo Volumen",
    selectVolume: "Seleccionar Volumen",
    insert: "Insertar",
    compoundVolume: "Volumen Compuesto",
    sensor: "Sensor",
    remove: "Eliminar",
    
    // Inspector Menu
    geometry: "Geometría",
    compositions: "Composiciones",
    sources: "Fuentes",
    calculationResults: "Resultados de Cálculo",
    nomConfig: "Config Nom",
    simple: "Simple",
    complete: "Completo",
    minConfig: "Config Mín",
    maxConfig: "Config Máx",
    
    // Scene Menu
    generateScene: "Generar Escena...",
    startComputation: "Iniciar Cálculo",
    
    // View Menu
    mesh: "Malla",
    cutPlane: "Plano de Corte",
    hideSolidAngleLines: "Ocultar Líneas de Ángulo Sólido",
    addSolidAngleLines: "Agregar Líneas de Ángulo Sólido...",
    normalView: "Vista Normal",
    
    // Axis Controls
    axis: "Eje",
    
    // View Mode Controls
    solid: "Sólido",
    wireframe: "Alambre",
    transparent: "Transparente",
    points: "Puntos",
    
    // Material Mode Controls
    material: "Material",
    solidMaterial: "Material Sólido",
    wireframeMaterial: "Material de Alambre",
    transparentMaterial: "Material Transparente",
    pointsMaterial: "Material de Puntos",
    
    // View Controls
    solidView: "Vista Sólida",
    wireframeView: "Vista de Alambre",
    pointsView: "Vista de Puntos",
    
    // Volume Form
    volumeName: "Nombre del Volumen",
    enterVolumeName: "Ingrese nombre del volumen",
    volumeType: "Tipo de Volumen",
    liquid: "Líquido",
    gas: "Gas",
    compound: "Compuesto",
    composition: "Composición",
    materialComposition: "Composición del Material",
    realDensity: "Densidad Real (g/cm³)",
    tolerance: "Tolerancia",
    source: "Fuente",
    sourceIdentifier: "Identificador de fuente",
    calculation: "Cálculo",
    byLines: "Por Líneas",
    byGroups: "Por Grupos",
    gammaSelectionMode: "Modo de Selección Gamma",
    automatic: "Automático",
    manual: "Manual",
    custom: "Personalizado",
    spectrum: "Espectro",
    spectrumConfiguration: "Configuración del espectro",
    reset: "Restablecer",
    cancel: "Cancelar",
    saveVolume: "Guardar Volumen",
    
    // Geometry Selector
    geometrySelector: "Selector de Geometría",
    cube: "Cubo",
    sphere: "Esfera",
    cylinder: "Cilindro",
    cone: "Cono",
    
    // Tools & Actions
    select: "Seleccionar",
    move: "Mover",
    rotate: "Rotar",
    delete: "Eliminar",
    frame: "Encuadrar",
    home: "Inicio",
    target: "Objetivo",
    pan: "Desplazar",
    hand: "Mano",
    
    // Tool Descriptions
    selectTool: "Seleccionar y manipular objetos",
    moveTool: "Mover/rotar objetos (Ctrl+Alt para rotación)",
    targetTool: "Clic para hacer zoom al objeto",
    addHomeTool: "Guardar vista actual de cámara como inicio",
    homeTool: "Volver a la vista de inicio guardada",
    viewTool: "Encuadrar todos los objetos en vista",
    cameraTool: "Alternar cámara perspectiva/ortográfica",
    
    // Window Controls
    minimize: "Minimizar",
    maximize: "Maximizar",
    restore: "Restaurar",
    close: "Cerrar",
    
    // Zoom Controls
    zoomIn: "Acercar",
    zoomOut: "Alejar",
    resetZoom: "Restablecer Zoom",
    zoom: "Zoom",
    
    // Language & Units
    language: "Idioma",
    units: "Unidades",
    millimeters: "Milímetros",
    centimeters: "Centímetros",
    meters: "Metros",
    inches: "Pulgadas",
    feet: "Pies",
    
    // Scene Modes
    nominalScene: "Escena Nominal",
    expertScene: "Escena Experta",
    expertMode: "Modo Experto",
    enabled: "Habilitado",
    disabled: "Deshabilitado",
    
    // Rotation Controls
    sceneRotation: "Rotación de Escena",
    horizontal: "Horizontal",
    vertical: "Vertical",
    
    // Help & Shortcuts
    keyboardShortcuts: "Atajos de Teclado",
    objectManipulation: "Manipulación de Objetos",
    clickObject: "Clic en objeto",
    selectObject: "Seleccionar objeto",
    dragGizmo: "Arrastrar gizmo",
    moveObject: "Mover objeto",
    rotateObject: "Rotar objeto (en modo Mover)",
    toggleMoveMode: "Alternar modo Mover",
    deleteSelectedObject: "Eliminar objeto seleccionado",
    
    // Keyboard Movement
    keyboardMovement: "Movimiento por Teclado",
    moveForward: "Mover adelante (eje Z)",
    moveBackward: "Mover atrás (eje Z)",
    moveLeft: "Mover izquierda (eje X)",
    moveRight: "Mover derecha (eje X)",
    moveUp: "Mover arriba (eje Y)",
    moveDown: "Mover abajo (eje Y)",
    
    // Camera Controls
    cameraControls: "Controles de Cámara",
    orbitCamera: "Orbitar cámara",
    mouseDrag: "Arrastrar ratón",
    mouseWheel: "Rueda del ratón",
    zoomInOut: "Acercar/alejar",
    saveHomeView: "Guardar vista Inicio",
    goToHomeView: "Ir a vista Inicio",
    frameAllObjects: "Encuadrar todos los objetos",
    frameSelectedObject: "Encuadrar objeto seleccionado",
    togglePerspectiveOrthographic: "Alternar perspectiva/ortográfica",
    
    // General Controls
    general: "General",
    deselectObject: "Deseleccionar objeto",
    toggleHelp: "Alternar esta ayuda",
    resetToolToSelect: "Restablecer herramienta a Seleccionar",
    
    // Contextual Help
    getStarted: "Comenzar",
    useGeometrySelector: "Use el Selector de Geometría (arriba-izquierda) para agregar objetos a la escena",
    targetMode: "Modo Objetivo",
    clickAnyObjectToZoom: "Haga clic en cualquier objeto para hacer zoom y enfocarlo",
    selectAnObject: "Seleccionar un Objeto",
    clickOnAnyObject: "Haga clic en cualquier objeto para seleccionarlo y manipularlo",
    moveModeActive: "Modo Mover Activo",
    dragGizmoToMove: "Arrastre el gizmo para mover • Mantenga Ctrl para rotar",
    objectSelected: "Objeto Seleccionado",
    useArrowKeysToMove: "Use las teclas de flecha para mover • Arrastre el gizmo para precisión • Ctrl+X para eliminar",
    
    // Status Messages
    sceneRestored: "Escena restaurada desde localStorage",
    sceneSaved: "Escena guardada en localStorage",
    objectDeleted: "Objeto eliminado",
    homeViewSaved: "Vista de inicio guardada",
    noHomeViewSaved: "No hay vista de inicio guardada",
    switchedToRotateMode: "Cambiado a modo rotar (Ctrl+Alt)",
    switchedBackToTranslateMode: "Vuelto a modo trasladar",
    
    // Collision Messages
    hardCollision: "FUERTE",
    mediumCollision: "MEDIO",
    softCollision: "SUAVE",
    collisionBetween: "colisión entre",
    intensity: "intensidad",
    
    // Scene States
    viewModeChangedTo: "Modo de vista cambiado a",
    materialModeChangedTo: "Modo de material cambiado a",
    axisChangedTo: "Eje cambiado a",
    zoomSetTo: "Zoom establecido en",
    sceneRotationSetTo: "Rotación de escena establecida en",
    cameraSetToViewAlong: "Cámara configurada para ver a lo largo del eje",
    
    // Countries & Languages
    english: "Inglés",
    spanish: "Español",
    french: "Francés",
    german: "Alemán",
    italian: "Italiano",
    portuguese: "Portugués"
  },
  
  fr: {
    // Navigation & Menus
    file: "Fichier",
    edit: "Éditer",
    inspector: "Inspecteur",
    scene: "Scène",
    view: "Vue",
    help: "Aide",
    
    // File Menu
    createScene: "Créer une Scène",
    save: "Enregistrer",
    saveAs: "Enregistrer sous...",
    print: "Imprimer",
    exportImage: "Exporter (Image)",
    quitMercurad: "Quitter Mercurad",
    
    // Edit Menu
    newVolume: "Nouveau Volume",
    selectVolume: "Sélectionner Volume",
    insert: "Insérer",
    compoundVolume: "Volume Composé",
    sensor: "Capteur",
    remove: "Supprimer",
    
    // Inspector Menu
    geometry: "Géométrie",
    compositions: "Compositions",
    sources: "Sources",
    calculationResults: "Résultats de Calcul",
    nomConfig: "Config Nom",
    simple: "Simple",
    complete: "Complet",
    minConfig: "Config Min",
    maxConfig: "Config Max",
    
    // Scene Menu
    generateScene: "Générer une Scène...",
    startComputation: "Démarrer le Calcul",
    
    // View Menu
    mesh: "Maillage",
    cutPlane: "Plan de Coupe",
    hideSolidAngleLines: "Masquer les Lignes d'Angle Solide",
    addSolidAngleLines: "Ajouter des Lignes d'Angle Solide...",
    normalView: "Vue Normale",
    
    // Axis Controls
    axis: "Axe",
    
    // View Mode Controls
    solid: "Solide",
    wireframe: "Filaire",
    transparent: "Transparent",
    points: "Points",
    
    // Material Mode Controls
    material: "Matériau",
    solidMaterial: "Matériau Solide",
    wireframeMaterial: "Matériau Filaire",
    transparentMaterial: "Matériau Transparent",
    pointsMaterial: "Matériau Points",
    
    // View Controls
    solidView: "Vue Solide",
    wireframeView: "Vue Filaire",
    pointsView: "Vue Points",
    
    // Volume Form
    volumeName: "Nom du Volume",
    enterVolumeName: "Entrez le nom du volume",
    volumeType: "Type de Volume",
    liquid: "Liquide",
    gas: "Gaz",
    compound: "Composé",
    composition: "Composition",
    materialComposition: "Composition du Matériau",
    realDensity: "Densité Réelle (g/cm³)",
    tolerance: "Tolérance",
    source: "Source",
    sourceIdentifier: "Identifiant de source",
    calculation: "Calcul",
    byLines: "Par Lignes",
    byGroups: "Par Groupes",
    gammaSelectionMode: "Mode de Sélection Gamma",
    automatic: "Automatique",
    manual: "Manuel",
    custom: "Personnalisé",
    spectrum: "Spectre",
    spectrumConfiguration: "Configuration du spectre",
    reset: "Réinitialiser",
    cancel: "Annuler",
    saveVolume: "Enregistrer Volume",
    
    // Geometry Selector
    geometrySelector: "Sélecteur de Géométrie",
    cube: "Cube",
    sphere: "Sphère",
    cylinder: "Cylindre",
    cone: "Cône",
    
    // Tools & Actions
    select: "Sélectionner",
    move: "Déplacer",
    rotate: "Faire pivoter",
    delete: "Supprimer",
    frame: "Cadrer",
    home: "Accueil",
    target: "Cible",
    pan: "Panoramique",
    hand: "Main",
    
    // Tool Descriptions
    selectTool: "Sélectionner et manipuler les objets",
    moveTool: "Déplacer/faire pivoter les objets (Ctrl+Alt pour rotation)",
    targetTool: "Cliquer pour zoomer sur l'objet",
    addHomeTool: "Enregistrer la vue caméra actuelle comme accueil",
    homeTool: "Retourner à la vue d'accueil enregistrée",
    viewTool: "Cadrer tous les objets dans la vue",
    cameraTool: "Basculer caméra perspective/orthographique",
    
    // Window Controls
    minimize: "Réduire",
    maximize: "Agrandir",
    restore: "Restaurer",
    close: "Fermer",
    
    // Zoom Controls
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    resetZoom: "Réinitialiser Zoom",
    zoom: "Zoom",
    
    // Language & Units
    language: "Langue",
    units: "Unités",
    millimeters: "Millimètres",
    centimeters: "Centimètres",
    meters: "Mètres",
    inches: "Pouces",
    feet: "Pieds",
    
    // Scene Modes
    nominalScene: "Scène Nominale",
    expertScene: "Scène Expert",
    expertMode: "Mode Expert",
    enabled: "Activé",
    disabled: "Désactivé",
    
    // Rotation Controls
    sceneRotation: "Rotation de Scène",
    horizontal: "Horizontal",
    vertical: "Vertical",
    
    // Help & Shortcuts
    keyboardShortcuts: "Raccourcis Clavier",
    objectManipulation: "Manipulation d'Objets",
    clickObject: "Cliquer sur l'objet",
    selectObject: "Sélectionner l'objet",
    dragGizmo: "Faire glisser le gizmo",
    moveObject: "Déplacer l'objet",
    rotateObject: "Faire pivoter l'objet (en mode Déplacer)",
    toggleMoveMode: "Basculer le mode Déplacer",
    deleteSelectedObject: "Supprimer l'objet sélectionné",
    
    // Keyboard Movement
    keyboardMovement: "Mouvement au Clavier",
    moveForward: "Avancer (axe Z)",
    moveBackward: "Reculer (axe Z)",
    moveLeft: "Aller à gauche (axe X)",
    moveRight: "Aller à droite (axe X)",
    moveUp: "Monter (axe Y)",
    moveDown: "Descendre (axe Y)",
    
    // Camera Controls
    cameraControls: "Contrôles de Caméra",
    orbitCamera: "Orbiter la caméra",
    mouseDrag: "Glisser la souris",
    mouseWheel: "Molette de souris",
    zoomInOut: "Zoomer/dézoomer",
    saveHomeView: "Enregistrer la vue Accueil",
    goToHomeView: "Aller à la vue Accueil",
    frameAllObjects: "Cadrer tous les objets",
    frameSelectedObject: "Cadrer l'objet sélectionné",
    togglePerspectiveOrthographic: "Basculer perspective/orthographique",
    
    // General Controls
    general: "Général",
    deselectObject: "Désélectionner l'objet",
    toggleHelp: "Basculer cette aide",
    resetToolToSelect: "Réinitialiser l'outil à Sélectionner",
    
    // Contextual Help
    getStarted: "Commencer",
    useGeometrySelector: "Utilisez le Sélecteur de Géométrie (en haut à gauche) pour ajouter des objets à la scène",
    targetMode: "Mode Cible",
    clickAnyObjectToZoom: "Cliquez sur n'importe quel objet pour zoomer et le cibler",
    selectAnObject: "Sélectionner un Objet",
    clickOnAnyObject: "Cliquez sur n'importe quel objet pour le sélectionner et le manipuler",
    moveModeActive: "Mode Déplacer Actif",
    dragGizmoToMove: "Glissez le gizmo pour déplacer • Maintenez Ctrl pour faire pivoter",
    objectSelected: "Objet Sélectionné",
    useArrowKeysToMove: "Utilisez les touches fléchées pour déplacer • Glissez le gizmo pour la précision • Ctrl+X pour supprimer",
    
    // Status Messages
    sceneRestored: "Scène restaurée depuis localStorage",
    sceneSaved: "Scène enregistrée dans localStorage",
    objectDeleted: "Objet supprimé",
    homeViewSaved: "Vue d'accueil enregistrée",
    noHomeViewSaved: "Aucune vue d'accueil enregistrée",
    switchedToRotateMode: "Basculé en mode rotation (Ctrl+Alt)",
    switchedBackToTranslateMode: "Retourné en mode translation",
    
    // Collision Messages
    hardCollision: "FORTE",
    mediumCollision: "MOYENNE",
    softCollision: "DOUCE",
    collisionBetween: "collision entre",
    intensity: "intensité",
    
    // Scene States
    viewModeChangedTo: "Mode de vue changé à",
    materialModeChangedTo: "Mode de matériau changé à",
    axisChangedTo: "Axe changé à",
    zoomSetTo: "Zoom défini à",
    sceneRotationSetTo: "Rotation de scène définie à",
    cameraSetToViewAlong: "Caméra configurée pour voir le long de l'axe",
    
    // Countries & Languages
    english: "Anglais",
    spanish: "Espagnol",
    french: "Français",
    german: "Allemand",
    italian: "Italien",
    portuguese: "Portugais"
  },
  
  de: {
    // Navigation & Menus
    file: "Datei",
    edit: "Bearbeiten",
    inspector: "Inspektor",
    scene: "Szene",
    view: "Ansicht",
    help: "Hilfe",
    
    // File Menu
    createScene: "Szene Erstellen",
    save: "Speichern",
    saveAs: "Speichern unter...",
    print: "Drucken",
    exportImage: "Exportieren (Bild)",
    quitMercurad: "Mercurad Beenden",
    
    // Edit Menu
    newVolume: "Neues Volumen",
    selectVolume: "Volumen Auswählen",
    insert: "Einfügen",
    compoundVolume: "Zusammengesetztes Volumen",
    sensor: "Sensor",
    remove: "Entfernen",
    
    // Inspector Menu
    geometry: "Geometrie",
    compositions: "Zusammensetzungen",
    sources: "Quellen",
    calculationResults: "Berechnungsergebnisse",
    nomConfig: "Nom Konfiguration",
    simple: "Einfach",
    complete: "Vollständig",
    minConfig: "Min Konfiguration",
    maxConfig: "Max Konfiguration",
    
    // Scene Menu
    generateScene: "Szene Generieren...",
    startComputation: "Berechnung Starten",
    
    // View Menu
    mesh: "Netz",
    cutPlane: "Schnittebene",
    hideSolidAngleLines: "Raumwinkellinien Ausblenden",
    addSolidAngleLines: "Raumwinkellinien Hinzufügen...",
    normalView: "Normale Ansicht",
    
    // Axis Controls
    axis: "Achse",
    
    // View Mode Controls
    solid: "Fest",
    wireframe: "Drahtgitter",
    transparent: "Transparent",
    points: "Punkte",
    
    // Material Mode Controls
    material: "Material",
    solidMaterial: "Festes Material",
    wireframeMaterial: "Drahtgitter-Material",
    transparentMaterial: "Transparentes Material",
    pointsMaterial: "Punkte-Material",
    
    // View Controls
    solidView: "Feste Ansicht",
    wireframeView: "Drahtgitter-Ansicht",
    pointsView: "Punkte-Ansicht",
    
    // Volume Form
    volumeName: "Volumenname",
    enterVolumeName: "Volumenname eingeben",
    volumeType: "Volumentyp",
    liquid: "Flüssigkeit",
    gas: "Gas",
    compound: "Verbindung",
    composition: "Zusammensetzung",
    materialComposition: "Materialzusammensetzung",
    realDensity: "Reale Dichte (g/cm³)",
    tolerance: "Toleranz",
    source: "Quelle",
    sourceIdentifier: "Quellen-Identifikator",
    calculation: "Berechnung",
    byLines: "Nach Linien",
    byGroups: "Nach Gruppen",
    gammaSelectionMode: "Gamma-Auswahlmodus",
    automatic: "Automatisch",
    manual: "Manuell",
    custom: "Benutzerdefiniert",
    spectrum: "Spektrum",
    spectrumConfiguration: "Spektrum-Konfiguration",
    reset: "Zurücksetzen",
    cancel: "Abbrechen",
    saveVolume: "Volumen Speichern",
    
    // Geometry Selector
    geometrySelector: "Geometrie-Auswahl",
    cube: "Würfel",
    sphere: "Kugel",
    cylinder: "Zylinder",
    cone: "Kegel",
    
    // Tools & Actions
    select: "Auswählen",
    move: "Bewegen",
    rotate: "Drehen",
    delete: "Löschen",
    frame: "Rahmen",
    home: "Start",
    target: "Ziel",
    pan: "Schwenken",
    hand: "Hand",
    
    // Tool Descriptions
    selectTool: "Objekte auswählen und manipulieren",
    moveTool: "Objekte bewegen/drehen (Strg+Alt für Rotation)",
    targetTool: "Klicken zum Zoomen auf Objekt",
    addHomeTool: "Aktuelle Kameraansicht als Start speichern",
    homeTool: "Zur gespeicherten Start-Ansicht zurückkehren",
    viewTool: "Alle Objekte in Ansicht einrahmen",
    cameraTool: "Perspektiv-/Orthographische Kamera umschalten",
    
    // Window Controls
    minimize: "Minimieren",
    maximize: "Maximieren",
    restore: "Wiederherstellen",
    close: "Schließen",
    
    // Zoom Controls
    zoomIn: "Vergrößern",
    zoomOut: "Verkleinern",
    resetZoom: "Zoom Zurücksetzen",
    zoom: "Zoom",
    
    // Language & Units
    language: "Sprache",
    units: "Einheiten",
    millimeters: "Millimeter",
    centimeters: "Zentimeter",
    meters: "Meter",
    inches: "Zoll",
    feet: "Fuß",
    
    // Scene Modes
    nominalScene: "Nominale Szene",
    expertScene: "Experten-Szene",
    expertMode: "Experten-Modus",
    enabled: "Aktiviert",
    disabled: "Deaktiviert",
    
    // Rotation Controls
    sceneRotation: "Szenen-Rotation",
    horizontal: "Horizontal",
    vertical: "Vertikal",
    
    // Help & Shortcuts
    keyboardShortcuts: "Tastenkürzel",
    objectManipulation: "Objekt-Manipulation",
    clickObject: "Objekt anklicken",
    selectObject: "Objekt auswählen",
    dragGizmo: "Gizmo ziehen",
    moveObject: "Objekt bewegen",
    rotateObject: "Objekt drehen (im Bewegen-Modus)",
    toggleMoveMode: "Bewegen-Modus umschalten",
    deleteSelectedObject: "Ausgewähltes Objekt löschen",
    
    // Keyboard Movement
    keyboardMovement: "Tastatur-Bewegung",
    moveForward: "Vorwärts bewegen (Z-Achse)",
    moveBackward: "Rückwärts bewegen (Z-Achse)",
    moveLeft: "Links bewegen (X-Achse)",
    moveRight: "Rechts bewegen (X-Achse)",
    moveUp: "Aufwärts bewegen (Y-Achse)",
    moveDown: "Abwärts bewegen (Y-Achse)",
    
    // Camera Controls
    cameraControls: "Kamera-Steuerung",
    orbitCamera: "Kamera umkreisen",
    mouseDrag: "Maus ziehen",
    mouseWheel: "Mausrad",
    zoomInOut: "Vergrößern/verkleinern",
    saveHomeView: "Start-Ansicht speichern",
    goToHomeView: "Zur Start-Ansicht gehen",
    frameAllObjects: "Alle Objekte einrahmen",
    frameSelectedObject: "Ausgewähltes Objekt einrahmen",
    togglePerspectiveOrthographic: "Perspektiv/orthographisch umschalten",
    
    // General Controls
    general: "Allgemein",
    deselectObject: "Objekt abwählen",
    toggleHelp: "Diese Hilfe umschalten",
    resetToolToSelect: "Werkzeug auf Auswählen zurücksetzen",
    
    // Contextual Help
    getStarted: "Erste Schritte",
    useGeometrySelector: "Verwenden Sie die Geometrie-Auswahl (oben links), um Objekte zur Szene hinzuzufügen",
    targetMode: "Ziel-Modus",
    clickAnyObjectToZoom: "Klicken Sie auf ein beliebiges Objekt zum Zoomen und Fokussieren",
    selectAnObject: "Ein Objekt Auswählen",
    clickOnAnyObject: "Klicken Sie auf ein beliebiges Objekt zum Auswählen und Manipulieren",
    moveModeActive: "Bewegen-Modus Aktiv",
    dragGizmoToMove: "Gizmo ziehen zum Bewegen • Strg halten zum Drehen",
    objectSelected: "Objekt Ausgewählt",
    useArrowKeysToMove: "Pfeiltasten zum Bewegen verwenden • Gizmo für Präzision ziehen • Strg+X zum Löschen",
    
    // Status Messages
    sceneRestored: "Szene aus localStorage wiederhergestellt",
    sceneSaved: "Szene in localStorage gespeichert",
    objectDeleted: "Objekt gelöscht",
    homeViewSaved: "Start-Ansicht gespeichert",
    noHomeViewSaved: "Keine Start-Ansicht gespeichert",
    switchedToRotateMode: "Zu Rotations-Modus gewechselt (Strg+Alt)",
    switchedBackToTranslateMode: "Zurück zu Translations-Modus gewechselt",
    
    // Collision Messages
    hardCollision: "HART",
    mediumCollision: "MITTEL",
    softCollision: "WEICH",
    collisionBetween: "Kollision zwischen",
    intensity: "Intensität",
    
    // Scene States
    viewModeChangedTo: "Ansichtsmodus geändert zu",
    materialModeChangedTo: "Material-Modus geändert zu",
    axisChangedTo: "Achse geändert zu",
    zoomSetTo: "Zoom eingestellt auf",
    sceneRotationSetTo: "Szenen-Rotation eingestellt auf",
    cameraSetToViewAlong: "Kamera eingestellt zum Betrachten entlang der Achse",
    
    // Countries & Languages
    english: "Englisch",
    spanish: "Spanisch",
    french: "Französisch",
    german: "Deutsch",
    italian: "Italienisch",
    portuguese: "Portugiesisch"
  },
  
  it: {
    // Navigation & Menus
    file: "File",
    edit: "Modifica",
    inspector: "Ispettore",
    scene: "Scena",
    view: "Vista",
    help: "Aiuto",
    
    // File Menu
    createScene: "Crea Scena",
    save: "Salva",
    saveAs: "Salva come...",
    print: "Stampa",
    exportImage: "Esporta (Immagine)",
    quitMercurad: "Esci da Mercurad",
    
    // Edit Menu
    newVolume: "Nuovo Volume",
    selectVolume: "Seleziona Volume",
    insert: "Inserisci",
    compoundVolume: "Volume Composto",
    sensor: "Sensore",
    remove: "Rimuovi",
    
    // Inspector Menu
    geometry: "Geometria",
    compositions: "Composizioni",
    sources: "Sorgenti",
    calculationResults: "Risultati di Calcolo",
    nomConfig: "Config Nom",
    simple: "Semplice",
    complete: "Completo",
    minConfig: "Config Min",
    maxConfig: "Config Max",
    
    // Scene Menu
    generateScene: "Genera Scena...",
    startComputation: "Avvia Calcolo",
    
    // View Menu
    mesh: "Mesh",
    cutPlane: "Piano di Taglio",
    hideSolidAngleLines: "Nascondi Linee Angolo Solido",
    addSolidAngleLines: "Aggiungi Linee Angolo Solido...",
    normalView: "Vista Normale",
    
    // Axis Controls
    axis: "Asse",
    
    // View Mode Controls
    solid: "Solido",
    wireframe: "Wireframe",
    transparent: "Trasparente",
    points: "Punti",
    
    // Material Mode Controls
    material: "Materiale",
    solidMaterial: "Materiale Solido",
    wireframeMaterial: "Materiale Wireframe",
    transparentMaterial: "Materiale Trasparente",
    pointsMaterial: "Materiale Punti",
    
    // View Controls
    solidView: "Vista Solida",
    wireframeView: "Vista Wireframe",
    pointsView: "Vista Punti",
    
    // Volume Form
    volumeName: "Nome Volume",
    enterVolumeName: "Inserisci nome volume",
    volumeType: "Tipo Volume",
    liquid: "Liquido",
    gas: "Gas",
    compound: "Composto",
    composition: "Composizione",
    materialComposition: "Composizione Materiale",
    realDensity: "Densità Reale (g/cm³)",
    tolerance: "Tolleranza",
    source: "Sorgente",
    sourceIdentifier: "Identificatore sorgente",
    calculation: "Calcolo",
    byLines: "Per Linee",
    byGroups: "Per Gruppi",
    gammaSelectionMode: "Modalità Selezione Gamma",
    automatic: "Automatico",
    manual: "Manuale",
    custom: "Personalizzato",
    spectrum: "Spettro",
    spectrumConfiguration: "Configurazione spettro",
    reset: "Ripristina",
    cancel: "Annulla",
    saveVolume: "Salva Volume",
    
    // Geometry Selector
    geometrySelector: "Selettore Geometria",
    cube: "Cubo",
    sphere: "Sfera",
    cylinder: "Cilindro",
    cone: "Cono",
    
    // Tools & Actions
    select: "Seleziona",
    move: "Muovi",
    rotate: "Ruota",
    delete: "Elimina",
    frame: "Inquadra",
    home: "Home",
    target: "Obiettivo",
    pan: "Panoramica",
    hand: "Mano",
    
    // Tool Descriptions
    selectTool: "Seleziona e manipola oggetti",
    moveTool: "Muovi/ruota oggetti (Ctrl+Alt per rotazione)",
    targetTool: "Clicca per zoomare sull'oggetto",
    addHomeTool: "Salva vista camera attuale come home",
    homeTool: "Torna alla vista home salvata",
    viewTool: "Inquadra tutti gli oggetti nella vista",
    cameraTool: "Alterna camera prospettiva/ortografica",
    
    // Window Controls
    minimize: "Minimizza",
    maximize: "Massimizza",
    restore: "Ripristina",
    close: "Chiudi",
    
    // Zoom Controls
    zoomIn: "Ingrandisci",
    zoomOut: "Rimpicciolisci",
    resetZoom: "Ripristina Zoom",
    zoom: "Zoom",
    
    // Language & Units
    language: "Lingua",
    units: "Unità",
    millimeters: "Millimetri",
    centimeters: "Centimetri",
    meters: "Metri",
    inches: "Pollici",
    feet: "Piedi",
    
    // Scene Modes
    nominalScene: "Scena Nominale",
    expertScene: "Scena Esperta",
    expertMode: "Modalità Esperta",
    enabled: "Abilitato",
    disabled: "Disabilitato",
    
    // Rotation Controls
    sceneRotation: "Rotazione Scena",
    horizontal: "Orizzontale",
    vertical: "Verticale",
    
    // Help & Shortcuts
    keyboardShortcuts: "Scorciatoie Tastiera",
    objectManipulation: "Manipolazione Oggetti",
    clickObject: "Clicca oggetto",
    selectObject: "Seleziona oggetto",
    dragGizmo: "Trascina gizmo",
    moveObject: "Muovi oggetto",
    rotateObject: "Ruota oggetto (in modalità Muovi)",
    toggleMoveMode: "Alterna modalità Muovi",
    deleteSelectedObject: "Elimina oggetto selezionato",
    
    // Keyboard Movement
    keyboardMovement: "Movimento Tastiera",
    moveForward: "Muovi avanti (asse Z)",
    moveBackward: "Muovi indietro (asse Z)",
    moveLeft: "Muovi sinistra (asse X)",
    moveRight: "Muovi destra (asse X)",
    moveUp: "Muovi su (asse Y)",
    moveDown: "Muovi giù (asse Y)",
    
    // Camera Controls
    cameraControls: "Controlli Camera",
    orbitCamera: "Orbita camera",
    mouseDrag: "Trascina mouse",
    mouseWheel: "Rotella mouse",
    zoomInOut: "Ingrandisci/rimpicciolisci",
    saveHomeView: "Salva vista Home",
    goToHomeView: "Vai alla vista Home",
    frameAllObjects: "Inquadra tutti gli oggetti",
    frameSelectedObject: "Inquadra oggetto selezionato",
    togglePerspectiveOrthographic: "Alterna prospettiva/ortografica",
    
    // General Controls
    general: "Generale",
    deselectObject: "Deseleziona oggetto",
    toggleHelp: "Alterna questo aiuto",
    resetToolToSelect: "Ripristina strumento a Seleziona",
    
    // Contextual Help
    getStarted: "Inizia",
    useGeometrySelector: "Usa il Selettore Geometria (in alto a sinistra) per aggiungere oggetti alla scena",
    targetMode: "Modalità Obiettivo",
    clickAnyObjectToZoom: "Clicca su qualsiasi oggetto per zoomare e focalizzarlo",
    selectAnObject: "Seleziona un Oggetto",
    clickOnAnyObject: "Clicca su qualsiasi oggetto per selezionarlo e manipolarlo",
    moveModeActive: "Modalità Muovi Attiva",
    dragGizmoToMove: "Trascina il gizmo per muovere • Tieni Ctrl per ruotare",
    objectSelected: "Oggetto Selezionato",
    useArrowKeysToMove: "Usa le frecce per muovere • Trascina il gizmo per precisione • Ctrl+X per eliminare",
    
    // Status Messages
    sceneRestored: "Scena ripristinata da localStorage",
    sceneSaved: "Scena salvata in localStorage",
    objectDeleted: "Oggetto eliminato",
    homeViewSaved: "Vista home salvata",
    noHomeViewSaved: "Nessuna vista home salvata",
    switchedToRotateMode: "Cambiato a modalità rotazione (Ctrl+Alt)",
    switchedBackToTranslateMode: "Tornato a modalità traslazione",
    
    // Collision Messages
    hardCollision: "FORTE",
    mediumCollision: "MEDIA",
    softCollision: "LEGGERA",
    collisionBetween: "collisione tra",
    intensity: "intensità",
    
    // Scene States
    viewModeChangedTo: "Modalità vista cambiata a",
    materialModeChangedTo: "Modalità materiale cambiata a",
    axisChangedTo: "Asse cambiato a",
    zoomSetTo: "Zoom impostato a",
    sceneRotationSetTo: "Rotazione scena impostata a",
    cameraSetToViewAlong: "Camera impostata per vedere lungo l'asse",
    
    // Countries & Languages
    english: "Inglese",
    spanish: "Spagnolo",
    french: "Francese",
    german: "Tedesco",
    italian: "Italiano",
    portuguese: "Portoghese"
  },
  
  pt: {
    // Navigation & Menus
    file: "Arquivo",
    edit: "Editar",
    inspector: "Inspetor",
    scene: "Cena",
    view: "Vista",
    help: "Ajuda",
    
    // File Menu
    createScene: "Criar Cena",
    save: "Salvar",
    saveAs: "Salvar como...",
    print: "Imprimir",
    exportImage: "Exportar (Imagem)",
    quitMercurad: "Sair do Mercurad",
    
    // Edit Menu
    newVolume: "Novo Volume",
    selectVolume: "Selecionar Volume",
    insert: "Inserir",
    compoundVolume: "Volume Composto",
    sensor: "Sensor",
    remove: "Remover",
    
    // Inspector Menu
    geometry: "Geometria",
    compositions: "Composições",
    sources: "Fontes",
    calculationResults: "Resultados de Cálculo",
    nomConfig: "Config Nom",
    simple: "Simples",
    complete: "Completo",
    minConfig: "Config Mín",
    maxConfig: "Config Máx",
    
    // Scene Menu
    generateScene: "Gerar Cena...",
    startComputation: "Iniciar Cálculo",
    
    // View Menu
    mesh: "Malha",
    cutPlane: "Plano de Corte",
    hideSolidAngleLines: "Ocultar Linhas de Ângulo Sólido",
    addSolidAngleLines: "Adicionar Linhas de Ângulo Sólido...",
    normalView: "Vista Normal",
    
    // Axis Controls
    axis: "Eixo",
    
    // View Mode Controls
    solid: "Sólido",
    wireframe: "Aramado",
    transparent: "Transparente",
    points: "Pontos",
    
    // Material Mode Controls
    material: "Material",
    solidMaterial: "Material Sólido",
    wireframeMaterial: "Material Aramado",
    transparentMaterial: "Material Transparente",
    pointsMaterial: "Material Pontos",
    
    // View Controls
    solidView: "Vista Sólida",
    wireframeView: "Vista Aramada",
    pointsView: "Vista Pontos",
    
    // Volume Form
    volumeName: "Nome do Volume",
    enterVolumeName: "Digite o nome do volume",
    volumeType: "Tipo de Volume",
    liquid: "Líquido",
    gas: "Gás",
    compound: "Composto",
    composition: "Composição",
    materialComposition: "Composição do Material",
    realDensity: "Densidade Real (g/cm³)",
    tolerance: "Tolerância",
    source: "Fonte",
    sourceIdentifier: "Identificador da fonte",
    calculation: "Cálculo",
    byLines: "Por Linhas",
    byGroups: "Por Grupos",
    gammaSelectionMode: "Modo de Seleção Gamma",
    automatic: "Automático",
    manual: "Manual",
    custom: "Personalizado",
    spectrum: "Espectro",
    spectrumConfiguration: "Configuração do espectro",
    reset: "Redefinir",
    cancel: "Cancelar",
    saveVolume: "Salvar Volume",
    
    // Geometry Selector
    geometrySelector: "Seletor de Geometria",
    cube: "Cubo",
    sphere: "Esfera",
    cylinder: "Cilindro",
    cone: "Cone",
    
    // Tools & Actions
    select: "Selecionar",
    move: "Mover",
    rotate: "Girar",
    delete: "Excluir",
    frame: "Enquadrar",
    home: "Início",
    target: "Alvo",
    pan: "Panorâmica",
    hand: "Mão",
    
    // Tool Descriptions
    selectTool: "Selecionar e manipular objetos",
    moveTool: "Mover/girar objetos (Ctrl+Alt para rotação)",
    targetTool: "Clique para dar zoom no objeto",
    addHomeTool: "Salvar vista atual da câmera como início",
    homeTool: "Voltar à vista inicial salva",
    viewTool: "Enquadrar todos os objetos na vista",
    cameraTool: "Alternar câmera perspectiva/ortográfica",
    
    // Window Controls
    minimize: "Minimizar",
    maximize: "Maximizar",
    restore: "Restaurar",
    close: "Fechar",
    
    // Zoom Controls
    zoomIn: "Ampliar",
    zoomOut: "Reduzir",
    resetZoom: "Redefinir Zoom",
    zoom: "Zoom",
    
    // Language & Units
    language: "Idioma",
    units: "Unidades",
    millimeters: "Milímetros",
    centimeters: "Centímetros",
    meters: "Metros",
    inches: "Polegadas",
    feet: "Pés",
    
    // Scene Modes
    nominalScene: "Cena Nominal",
    expertScene: "Cena Especialista",
    expertMode: "Modo Especialista",
    enabled: "Habilitado",
    disabled: "Desabilitado",
    
    // Rotation Controls
    sceneRotation: "Rotação da Cena",
    horizontal: "Horizontal",
    vertical: "Vertical",
    
    // Help & Shortcuts
    keyboardShortcuts: "Atalhos do Teclado",
    objectManipulation: "Manipulação de Objetos",
    clickObject: "Clique no objeto",
    selectObject: "Selecionar objeto",
    dragGizmo: "Arrastar gizmo",
    moveObject: "Mover objeto",
    rotateObject: "Girar objeto (no modo Mover)",
    toggleMoveMode: "Alternar modo Mover",
    deleteSelectedObject: "Excluir objeto selecionado",
    
    // Keyboard Movement
    keyboardMovement: "Movimento por Teclado",
    moveForward: "Mover para frente (eixo Z)",
    moveBackward: "Mover para trás (eixo Z)",
    moveLeft: "Mover para esquerda (eixo X)",
    moveRight: "Mover para direita (eixo X)",
    moveUp: "Mover para cima (eixo Y)",
    moveDown: "Mover para baixo (eixo Y)",
    
    // Camera Controls
    cameraControls: "Controles da Câmera",
    orbitCamera: "Orbitar câmera",
    mouseDrag: "Arrastar mouse",
    mouseWheel: "Roda do mouse",
    zoomInOut: "Ampliar/reduzir",
    saveHomeView: "Salvar vista Início",
    goToHomeView: "Ir para vista Início",
    frameAllObjects: "Enquadrar todos os objetos",
    frameSelectedObject: "Enquadrar objeto selecionado",
    togglePerspectiveOrthographic: "Alternar perspectiva/ortográfica",
    
    // General Controls
    general: "Geral",
    deselectObject: "Desselecionar objeto",
    toggleHelp: "Alternar esta ajuda",
    resetToolToSelect: "Redefinir ferramenta para Selecionar",
    
    // Contextual Help
    getStarted: "Começar",
    useGeometrySelector: "Use o Seletor de Geometria (canto superior esquerdo) para adicionar objetos à cena",
    targetMode: "Modo Alvo",
    clickAnyObjectToZoom: "Clique em qualquer objeto para dar zoom e focalizá-lo",
    selectAnObject: "Selecionar um Objeto",
    clickOnAnyObject: "Clique em qualquer objeto para selecioná-lo e manipulá-lo",
    moveModeActive: "Modo Mover Ativo",
    dragGizmoToMove: "Arraste o gizmo para mover • Segure Ctrl para girar",
    objectSelected: "Objeto Selecionado",
    useArrowKeysToMove: "Use as setas para mover • Arraste o gizmo para precisão • Ctrl+X para excluir",
    
    // Status Messages
    sceneRestored: "Cena restaurada do localStorage",
    sceneSaved: "Cena salva no localStorage",
    objectDeleted: "Objeto excluído",
    homeViewSaved: "Vista inicial salva",
    noHomeViewSaved: "Nenhuma vista inicial salva",
    switchedToRotateMode: "Mudou para modo rotação (Ctrl+Alt)",
    switchedBackToTranslateMode: "Voltou para modo translação",
    
    // Collision Messages
    hardCollision: "FORTE",
    mediumCollision: "MÉDIA",
    softCollision: "SUAVE",
    collisionBetween: "colisão entre",
    intensity: "intensidade",
    
    // Scene States
    viewModeChangedTo: "Modo de vista alterado para",
    materialModeChangedTo: "Modo de material alterado para",
    axisChangedTo: "Eixo alterado para",
    zoomSetTo: "Zoom definido para",
    sceneRotationSetTo: "Rotação da cena definida para",
    cameraSetToViewAlong: "Câmera configurada para ver ao longo do eixo",
    
    // Countries & Languages
    english: "Inglês",
    spanish: "Espanhol",
    french: "Francês",
    german: "Alemão",
    italian: "Italiano",
    portuguese: "Português"
  }
};

// Helper function to get translated text
export const t = (key, lang = 'en') => {
  return translations[lang]?.[key] || translations.en[key] || key;
};

// Helper function to get current language translations
export const getTranslations = (lang = 'en') => {
  return translations[lang] || translations.en;
};
