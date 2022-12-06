# Trackle: the free symptom tracker

Understand your own chronic or acute feelings and activities with our unique data-entry and time-series visualization tools.

## Recorder page: Self-report your symptoms and activities

- Record your pain levels
- Record your stomach / digestion issues and bathroom usage
- Record medical events such as taking medicine, treatments and vaccines
- Record behavioral events such as eating, drinking and sleeping

## Viewer page: Visualize your symptoms

- View all recorded symptoms, feelings, events and activities on a time-series chart
- Filter to certain symptom or activity types
- Filter by a date range
- Save or print your charts
- Export your raw data

## Provider / Doctor's View (coming "soon")

- Share a view of your patient data with a selected medical provider or caretaker
- Providers can view a list of all patients who have granted them access


## The Tech Platform

**A web application** for easy and elegant user input (Materialize CSS with vanilla JS and the Toast charting library).

**A Node.js / Express backend** using EJS templates, pages and partials.

**A triple persistence layer:**
1. Time-series data and built-in visualization on InfluxDB Cloud
2. MySQL Cloud
3. In-Memory cache
