# Métodos Lab · Laboratorio numérico

Abre index.html en tu navegador. No requiere instalación ni conexión a internet.

Selecciona Lagrange (sesión 08) o Newton (sesión 09) en el navbar. Cada sección conserva sus datos mientras cambias de tema y comparte el diseño rosado, los nodos editables, la gráfica, el desarrollo, la teoría y la descarga de resultados.

- Lagrange: ejemplo de memoria y latencia. P(6) = 55,25.
- Newton: ejemplo de carga y latencia del documento de sesión 09. Nodos (1,45), (2,65), (4,110), (7,220). x se mide en centenas de req/s. P(5) = 139 ms.
- Newton muestra la tabla triangular completa, los coeficientes, las contribuciones de cada término, el polinomio estándar y los residuos en los nodos.
- Ambas secciones admiten entre 2 y 10 nodos y un intervalo de gráfica configurable. Pulsa Calcular interpolación después de editar.

Newton usa diferencias divididas y evaluación por multiplicación anidada. Su polinomio del ejemplo es P(x) = x³/3 − 3x²/2 + 133x/6 + 24.

JavaScript utiliza doble precisión; la pantalla redondea a 10 cifras significativas. Extrapolar puede ser poco fiable.

Archivos: index.html, styles.css y script.js deben permanecer juntos.

Validación: pruebas en Edge de ambos ejemplos, navegación con conservación de datos, nodos repetidos, extrapolación, adición de nodos, intervalo inválido y ausencia de desbordamiento horizontal a 390 px. Revisión visual de Newton en escritorio y móvil.
