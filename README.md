# box-pin-color-graph

A box pin color graph is a type of graph where:

- There are boxes
- There are pins connected to the boxes
- There are colors associated with each pin
- Each pin is part of a network. All pins in a network are mutually connected with edges

There are two types of boxes, `FixedBox` and `FloatingBox`. A
floating box does not have a position.

All pins have positions relative to the box.

This library has BPC utilities that allow you to...

1. Compare the similarity of two BPC graphs
2. Performing operations on a BPC graph (often to transform a FloatingBox BPC graph into a FixedBox BPC graph)
3. Converting a Floating Box BPC graph into a more legible Fixed Box BPC graph with force-directed auto layout

Here are some properties of a BPC graph:

- Boxes do not have a size, their pins represent their bounds
- FixedBoxes have an X/Y position representing the center of their bounds
- FloatingBoxes do not have a position
- Pins have a position relative to a box
- Pins have a color

## Where BPC graphs are used

### Schematic Layout

- When automatically laying out schematics, we convert our "un-laid-out" schematic into
  a Floating Box BPC graph, then we can pick the best template Fixed Box BPC graph. We
  can then adapt the template BPC graph to become equivalent to the Floating Box BPC graph,
  but with Fixed Boxes
- Pin colors are used to represent an important attribute of the pin- e.g. "red" is power and "yellow" is
  ground in the example below

Example Schematic Layout:

![image](https://github.com/user-attachments/assets/2efa5e6f-b0ba-478f-8cb8-361db267fab4)

Example Fixed Box BPC Graph template for the layout above:

![image](https://github.com/user-attachments/assets/2a5b543b-32e5-4d25-bcc5-f02845e60a9e)
