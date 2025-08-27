# Book Content
It is expected that the book contents have the following properties
* The content should be correct :)
* A reader who has followed the book should be able to understand it
  * No reference to something complex outside the book
* Use images for a better understanding of the content.

# Book Style
In this section, we place conventions for a uniform book style.
* Code comments should be written in English.

# Problems
* Problems are in the "problems" folder and in YAML format.
* Problems must be placed in the third layer
  * That is, chapter folder / sub-chapter folder / problem file
* Theory problems
  * Each one is a separate file.
  * Their name is the problem number.
  * Parameters
    * text: mandatory and in markdown
    * hint: optional - markdown
    * solution: optional - markdown
    * cat: optional - one subset of the signs *!+- according to the "Introduction to Graph Theory by West Douglas" book
* Code problems
  * Placed inside extra.yaml file.
  * They are an array of problems
  * Parameters of each problem
    * name: mandatory - a Persian string
    * hint: optional - markdown
    * solution: optional - markdown
    * cat: optional - one subset of the signs *!+- according to the "Introduction to Graph Theory by West Douglas" book
* Try to sort problems approximately by difficulty
  * Don't take it too hard. It's enough that an obvious problem is not at the end of the problems
  * Because shifting problems is hard and time-consuming, instead of shifting, find a suitable problem and swap it with it.
* Be sure to use natural numbers for naming problems.
