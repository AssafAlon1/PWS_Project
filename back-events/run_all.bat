node ./scripts/test.js https://pws-hw3-niw1.onrender.com
echo "Sleeping after test... zzZ"
timeout /t 3

node ./scripts/gptest.js https://pws-hw3-niw1.onrender.com
echo "Sleeping after test... zzZ"
timeout /t 3

node ./scripts/new_group_tests.js https://pws-hw3-niw1.onrender.com
echo "We did it! zzZ"
