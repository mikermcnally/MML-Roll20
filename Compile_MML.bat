copy /b MML_Test.js tmp.txt

del MML_Test.js

copy /b *.js MML_Roll20.js

copy /b tmp.txt MML_Test.js

del tmp.txt

CLIP < MML_Roll20.js