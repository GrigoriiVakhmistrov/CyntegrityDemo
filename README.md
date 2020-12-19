# CyntegrityDraft

# Environment
- MongoDB 4.4.2 Community
- Node.js 14.15.2 LTS
- Visual Studio 16.8.3 Community
- No need init db scripts. Just install npm packages and start npm server.js file

# How to start
- Clone or download repository
- Execute 'npm install' command in console in root repository folder. You need installing Node.js on your computer
- Execute 'npm start' command in console in root repository folder. You need running mongoDB on localhost with default settings (port) and without authorization
- Open [site](http://localhost:3000) in your browser

# For median calculating:
- feasible to fetch all DB collection data in memory (application layer) - https://stackoverflow.com/questions/20456095/calculate-the-median-in-mongodb-aggregation-framework
  (get all data, filter(if necessary), sort, and getting mid element)
- not feasible to fetch all DB collection data in memory (db layer) - https://www.compose.com/articles/mongo-metrics-finding-a-happy-median/ (use aggregation framework (in case MongoDB, MongoDb hasn't $median operator, but we can use aggregation pipeline - filter elements, count, sort and get high and low midpoints, then calculate median))

# For median displaying:
After we get datasource, we can use any of visual JS components - I assume, we can use any of bar or line charts for these purposes. If we have a huge datasource, we need check the chart performance. Also, in this case we can to prepare datasource (to reduce with data aggregation)
