# box-pin-color-graph

A box pin color graph is a type of graph where:

- There are boxes
- There are pins connected to the boxes
- There are colors associated with each pin

There are two types of boxes, `StaticBox` and `FloatingBox`. A
floating box does not have a position.

All pins have positions relative to the box.

This library has BPC utilities that allow you to...

1. Compare the similarity of two BPC graphs
2. Performing operations on a BPC graph (often to transform a FloatingBox BPC graph into a StaticBox BPC graph)

Here are some properties of a BPC graph:

- Boxes do not have a size, their pins represent their bounds
- StaticBoxes have an X/Y position representing the center of their bounds
- FloatingBoxes do not have a position
- Pins have a position relative to a box
- Pins have a color

## Where BPC graphs are used

-
