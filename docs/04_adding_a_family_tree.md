# Adding a family tree

> Our ancestors look at us from the sky, forgotten in the hustle and bustle. In the hope of somehow saving the situation, we abuse the means of the computer - we hope that social networks with all the Rolodexes will not disappear in the near future, we save records of the birthdays of relatives and old memories in the phone notes, we create secret Word documents with contacts important to us of people. -- From *Dictatum of Soul*

Evenor allows you to organize an innumerable number of lifelines of all kinds of people. Think queries like "all the events of the life of all people on Tuesdays", "the events of the life of a great-grandfather in World War II", "who in my family was at the party somewhere in May 2007". To make such searches, add your ancestors a dataset of events. The events of their births are birthdays, the events of their deaths are anniversaries, the stories of their lives are incidents that feed our own stories.

The standard for storing family trees is [GEDCOM](https://en.wikipedia.org/wiki/GEDCOM), which describes connections between relatives in plain text. Genealogy applications convert data about connections into vector graph drawings. For example, [genea](https://www.genea.app) generates graphics directly from GEDCOM using [graphviz](https://graphviz.org/), and others like [GRAMPS](https://gramps-project.org) first cache the entire family tree into SQL and then draw charts. 

A graph of parents and children drawn from GEDCOM is visually clear, but doesn't scale well on large datasets. At 10 generations the family tree grows larger than a thousand individuals and the drawing becomes too large to navigate. Evenor takes a diffent approach and only shows direct relatives of one person at a time. This is similar to moving one's gaze between individuals on a family tree graph - first see all relatives of Ben, then you look at Ben's father Donell and see all of their relatives - and so on. 

You can see an example of the family tree in the `tutorial` dataset. Select `parent` branch in the root profile to open the record overview of all available people. Confirm a `Search cognate?` dialogue near any person to open a record overview of all people who have Ben as `parent`. You can continue to query children and parents of each person to navigate the family tree. 

To learn more about evenor, see other [User Guides](./user_guides.md), the [Reference](./reference.md) and the [Requirements](./requirements.md).
