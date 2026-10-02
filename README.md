# Rosé · Calculadora de interpolación de Lagrange

## Cómo usar

Abre `index.html` con doble clic en Chrome, Edge o Firefox. No requiere instalación, servidor ni conexión a internet. Conserva `index.html`, `styles.css` y `script.js` en la misma carpeta.

1. Ingresa los nodos (x, y). Cada x debe ser diferente.
2. Indica el punto a evaluar y el intervalo de la gráfica.
3. Pulsa **Calcular interpolación**.
4. Revisa el resultado, las bases, el polinomio y las contribuciones. **Descargar resultados** guarda el desarrollo en un archivo de texto.

El botón **Restaurar ejemplo del documento** carga (2,150), (4,85), (8,50), (12,70), evalúa x = 6 y grafica en [2,12]. La latencia interpolada es **55,25 ms**.

## Requisitos de la parte dos

- Cuatro nodos editables y punto de evaluación editable.
- Algoritmo directo de Lagrange con bucles anidados O(n²).
- Resultado numérico, curva en [2,12], nodos experimentales y punto evaluado destacado.
- Extensión para otros problemas: de 2 a 10 nodos e intervalo configurable.
- Teoría de nodos, bases, evaluación, gráfica y extrapolación.
- Desarrollo algebraico de las bases y del polinomio en forma estándar.

## Archivos

- `index.html`: estructura y contenido educativo.
- `styles.css`: diseño rosado pastel y adaptación a móvil.
- `script.js`: motor matemático, validación, gráfica SVG y exportación.

## Precisión y alcance

JavaScript utiliza números de doble precisión. Se muestran hasta 10 cifras significativas; los cálculos conservan la precisión disponible. El grado es como máximo n − 1; puede ser menor si los datos lo permiten. El polinomio desarrollado puede acumular redondeo con nodos cercanos o valores grandes. La evaluación utiliza directamente la fórmula de Lagrange. Interpolar no garantiza que el modelo reproduzca un fenómeno físico; la extrapolación se identifica en pantalla.

## Validación

Se verificaron P(6) = 55,25, el paso por todos los nodos, la concordancia entre el polinomio desarrollado y Lagrange y un caso lineal. Se revisó la interfaz en Edge a 1440 px y 390 px, y se comprobaron nodos repetidos, extrapolación, adición de nodos e intervalo inválido.
