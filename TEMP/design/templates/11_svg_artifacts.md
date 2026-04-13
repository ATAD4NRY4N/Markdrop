---
title: Customer Education MARP Markdown Template for 2025 / v16
author: Danny Ryan, (Global) Director of Education at Ataccama Corp.
description: Supports our Docs-as-code initiative for 2025. Training Materials are created using MARP Markdown.
keywords: Marp, Slides, Themes, Brand, v16, 2025
marp: true
paginate: false
theme: ataccama_2024
---

<div class="artifact logo black"></div>

# Artifact variables

## Definition:

<div class="container.row">
  <div class="row">

  <div class="column" style="width: 15%;">

  ```[shape]```
  - circle
  - rectangle
  - arrow
  </div>

  <div class="column" style="width: 15%;">

  ```[fill]```
  - solid
  - outline
  </div>
  <div class="column" style="width: 15%;">

  ```[color]```
  - primary
  - secondary
  - tertiary
  </div>
  <div class="column" style="width: 30%;">

  ```[x-position]```
  - pixels, 50px incr.
    - x-0 > x-1900
  - percentage, 5% incr.
    - x-0p > x-100p
  </div>
  <div class="column" style="width: 30%;">

  ```[y-position]```
  - pixels, 50px incr.
    - y-0 > y-1050
  - percentage, 5% incr.
    - y-0p > y-100p

  </div>
  </div>
  <div class="row">

  <div class="column" style="width: 20%;">
  
  ```[width]```
  - pixels, 50px incr.
    - w-50 > w-400
  </div>
  <div class="column" style="width: 20%;">

  ```[height]```
  - pixels, 50px incr.
    - h-50 > h-400
  </div>
  <div class="column" style="width: 20%;">

  ```[rotation]```
  - degres, 15° incr.
    - rotate-0 > rotate-345
  </div>
  
  <div class="column" style="width: 20%;">

  ```[alignment]```
  - align-left
  - align-centre
  - align-right
  </div>
  <div class="column" style="width: 20%;">

  ```[alignment]```
  - align-top
  - align-middle
  - align-bottom
  </div>

  </div>
</div>

---
# Slide 1: Circle
<div class="artifact logo black"></div>

```artifact [shape]   [fill]    [color]   [x-position] [y-position] [width] [height] [rotation]```
```artifact circle    solid     primary   x-500        y-500        w-400   h-400    rotate-0```
```artifact circle    outline   primary   x-1000       y-500        w-400   h-400    rotate-90```

<div class="artifact circle solid primary x-100 y-500 w-400 h-400 rotate-0"></div>
<div class="artifact circle outline primary x-500 y-500 w-400 h-400 rotate-0"></div>
<div class="artifact circle solid primary x-1000 y-500 w-400 h-400 rotate-0 align-centre align-middle">
  Hello World
</div>
<div class="artifact circle outline primary x-1400 y-500 w-400 h-400 rotate-0 align-centre align-middle">
  Hello World
</div>

---
# Slide 2: Rectangle
<div class="artifact logo black"></div>

```artifact [shape]   [fill]    [color]   [x-position] [y-position] [width] [height] [rotation]```
```artifact rectangle solid     secondary   x-500        y-500        w-400   h-400    rotate-0```
```artifact rectangle outline   secondary   x-1000       y-500        w-400   h-400    rotate-90```

<div class="artifact rectangle solid secondary x-100 y-500 w-400 h-400 rotate-0"></div>
<div class="artifact rectangle outline secondary x-500 y-500 w-400 h-400 rotate-0"></div>
<div class="artifact rectangle solid secondary x-1000 y-500 w-400 h-400 rotate-0 align-centre align-middle">
  Hello World
</div>
<div class="artifact rectangle outline secondary x-1400 y-500 w-400 h-400 rotate-0 align-centre align-middle">
  Hello World
</div>

---
# Slide 3: Arrow
<div class="artifact logo black"></div>

### Only solid fill is supported.
```artifact [shape]     [fill]  [color]   [x-position] [y-position] [width] [height] [rotation]```
```artifact left-arrow  solid   tertiary  x-500        y-500        w-400   h-400    rotate-0```
```artifact right-arrow solid   tertiary  x-1000       y-500        w-400   h-400    rotate-90```

<div class="artifact left-arrow solid tertiary x-100 y-500 w-400 h-400 rotate-0"></div>
<div class="artifact right-arrow solid tertiary x-500 y-500 w-400 h-400 rotate-0"></div>
<div class="artifact left-arrow solid tertiary x-1000 y-500 w-400 h-400 rotate-0 align-centre align-middle">
  Hello World
</div>
<div class="artifact right-arrow solid tertiary x-1400 y-500 w-400 h-400 rotate-0 align-centre align-middle">
  Hello World
</div>

---
# Slide 4: Triangle
<div class="artifact logo black"></div>

### Only solid fill is supported.
```artifact [shape]   [fill]  [color]   [x-position] [y-position] [width] [height] [rotation]```
```artifact triangle  solid   primary  x-700        y-500        w-400   h-400    rotate-0```

<div class="artifact triangle solid primary x-500 y-500 w-400 h-400 rotate-0"></div>
<div class="artifact triangle solid primary x-1000 y-500 w-400 h-400 rotate-0 align-centre align-middle">
  Hello World
</div>

---
# Slide 5: Star
<div class="artifact logo black"></div>

### Only solid fill is supported.
```artifact [shape]   [fill]  [color]   [x-position] [y-position] [width] [height] [rotation]```
```artifact star      solid   secondary  x-700        y-500        w-400   h-400    rotate-0```

<div class="artifact star solid secondary x-500 y-500 w-400 h-400 rotate-0"></div>
<div class="artifact star solid secondary x-1000 y-500 w-400 h-400 rotate-0 align-centre align-middle">
  Hello World
</div>

---
# Slide 6: Point
<div class="artifact logo black"></div>

### Only solid fill is supported.
```artifact [shape]     [fill]  [color]   [x-position] [y-position] [width] [height] [rotation]```
```artifact left-point  solid   tertiary  x-500        y-500        w-400   h-400    rotate-0```
```artifact right-point solid   tertiary  x-1000       y-500        w-400   h-400    rotate-90```

<div class="artifact left-point solid tertiary x-500 y-500 w-400 h-400 rotate-0"></div>
<div class="artifact right-point solid tertiary x-1000 y-500 w-400 h-400 rotate-0 align-centre align-middle">
  Hello World
</div>

---
# Slide 7: Speech bubble
<div class="artifact logo black"></div>

```artifact [shape]   [color]   [x-position] [y-position] [width] [height] [alignment]  [arrow]```
```artifact speech    primary   x-100        y-600        w-400   h-100    align-left   topleft```
```artifact speech    secondary x-700        y-600        w-400   h-150    align-right  bottommiddle```
```artifact speech    tertiary  x-1300       y-600        w-400   h-350    align-bottom lefttop```

<!-- TOP -->
<div class="artifact speech primary x-100 y-500 w-350 h-100 align-centre align-middle topleft">
  This speech bubble has an arrow pointing to its top left.
</div>

<div class="artifact speech primary x-100 y-650 w-350 h-100 align-centre align-middle topmiddle">
  This speech bubble has an arrow pointing to its top middle.
</div>

<div class="artifact speech primary x-100 y-800 w-350 h-100 align-centre align-middle topright">
  This speech bubble has an arrow pointing to its top right.
</div>

<!-- BOTTOM -->
<div class="artifact speech secondary x-550 y-500 w-350 h-100 align-centre align-middle bottomleft">
  This speech bubble has an arrow pointing to its bottom left.
</div>

<div class="artifact speech secondary x-550 y-650 w-350 h-100 align-centre align-middle bottommiddle">
  This speech bubble has an arrow pointing to its bottom middle.
</div>

<div class="artifact speech secondary x-550 y-800 w-350 h-100 align-centre align-middle bottomright">
  This speech bubble has an arrow pointing to its bottom right.
</div>

<!-- LEFT -->
<div class="artifact speech tertiary x-1000 y-500 w-350 h-100 align-centre align-middle lefttop">
  This speech bubble has an arrow pointing to its left top.
</div>

<div class="artifact speech tertiary x-1000 y-650 w-350 h-100 align-centre align-middle leftmiddle">
  This speech bubble has an arrow pointing to its left middle.
</div>

<div class="artifact speech tertiary x-1000 y-800 w-350 h-100 align-centre align-middle leftbottom">
  This speech bubble has an arrow pointing to its left bottom.
</div>

<!-- RIGHT -->
<div class="artifact speech tertiary x-1450 y-500 w-350 h-100 align-centre align-middle righttop">
  This speech bubble has an arrow pointing to its right top.
</div>

<div class="artifact speech tertiary x-1450 y-650 w-350 h-100 align-centre align-middle rightmiddle">
  This speech bubble has an arrow pointing to its right middle.
</div>

<div class="artifact speech tertiary x-1450 y-800 w-350 h-100 align-centre align-middle rightbottom">
  This speech bubble has an arrow pointing to its right bottom.
</div>