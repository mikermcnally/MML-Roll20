copy /b MML_Test_scripts.js tmp1.txt
copy /b MML_Test_setup.js tmp2.txt

del MML_Test.js
del MML_Test_scripts.js
del MML_Test_setup.js

copy /b *.js MML_Roll20.js

copy /b tmp1.txt MML_Test_scripts.js
copy /b tmp2.txt MML_Test_setup.js
copy /b MML_Roll20.js+tmp2.txt MML_Test.js

del tmp1.txt
del tmp2.txt

CLIP < MML_Roll20.js

node MML_Test_scripts