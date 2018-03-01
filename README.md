# Map analysis

Repo for https://luke-codewalker.github.io/neuroprojekt2017-map-analysis/.

## TODO :sweat_smile:
- [x] implement functionality
- [x] add styles
- [x] add error checking and messages 
- [x] add optional header control
- [ ] extend readme
- [ ] clean up code


### Expected data format
The site expects data to be in a CSV-file with values separated by commas and newlines separating rows. It will also expect it to have to header rows (one for variable names and one for the description). Every row of coordinate data is expected to have the width and height of the image displayed to survey participants as first and second value and then two values for the x and y coordinates of every marked point. This is already the case if the dataset was generated with the heatmap tool.

In short, data should look like this:

ID|...|U501_1|U501_2|U501_3|U501_4|...
--|---|------|------|------|------|---
"Individuelle ID"|...|"Top 5 Stationen: Breite"|"Top 5 Stationen: Höhe"|"Top 5 Stationen: x"|Top 5 Stationen: y"|...
ABC12|...|800|600|50|90|...
FGJ56|...|700|530|150|10|...
NMO11|...|800|600|90|120|...
