# trackle: the symptom tracker
Record (self-report) and visualize your symptoms.  
Initially focused on pain and IBS/IBD digestive issues.  
Planning to extend to allow users to record medical and behavioral events such as taking medicine, eating, drinking and sleeping.

### The Tech

**A web application** for easy and elegant user input (Materialize CSS with vanilla JS).

**A Node.js / Express backend** using EJS templates.

**A triple persistence layer:**
1. Time-series data and built-in visualization on InfluxDB Cloud
2. MySQL Cloud
3. Server cache

The web app "Viewer" page currently shows raw JSON from the server cache, but will soon be improved to show graphs of the data from MySQL.
