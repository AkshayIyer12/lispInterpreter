# Lisp_Interpreter 
This is a Lisp Interpreter is written in JavaScript.
In lisp the statements are in the order of (keyword identifier expression), (keyword expression)
and the expressions are in the order of (operator operand operand).
e.g. 
(define a 10)
(define a (+ 10 20))
(print a)
(print (* 20 20))
(define square (lambda (x) (* x x)))
(print (square 20)