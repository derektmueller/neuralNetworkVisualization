
An AI player that gets trained with a feedforward neural network to aim for a target moving at a constant velocity. Training examples consist of 3 sequential x-coordinate observations made at regular intervals. Training set size is capped at 100 for performance reasons, so the AI player reaches peak ability after about 2 minutes. Output nodes map to evenly sized x-coordinate intervals and the single hidden layer is abitrarily given ((input nodes + output nodes) / 2) nodes.

https://derekmueller.info/views/dotGame.html

For comparison, here's the same game with the AI player trained using mutlivariate linear regression:

https://derekmueller.info/views/multivariateLR.html
