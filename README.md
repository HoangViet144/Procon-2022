# Procon 2022 "Kỹ thuật hồi chiến"
This project is conducted as a reference or demo for Procon 2022 contest by students of Ho Chi Minh City University of Technology, Vietnam National University Ho Chi Minh City.

Member:
* [Viet H. Tran](https://github.com/HoangViet144)
* [Khoa A. Lu](https://github.com/khoalu)
* [Tri P. M. Nguyen](https://github.com/NPmtri)

The whole project is created based on the rule in the folder /rule, or you can look up on the olp.vn website. Therefore, it is necessary to make some modifications to fit
the server of the contest.

The summary of what we have done so far is listed below:
* Web-based client that supports get ppm image, splits to pieces, creates free swap area, creates free drag area (you can uncomment the code to see). Besides, we also support
manual playing by creating a control panel which you can do any action defined in the rule. For better UX, we also handle some keyboard to improve the speed of playing.
In addition, our client automatically tracks your actions and creates submission.
* Tool to create test data. You can checkout branch /create-data and import an image, split it as you want, rotate and swap it. Then, the client
will create a ppm file version of that image.
* Simple server that serves static ppm file containing all information based on the rule.
* Some documents, papers and algorithm we have researched to complete the game automatically.

