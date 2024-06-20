# SN-Workday-ScriptedRestAPI
HTTP Get for importing Workday positions into a table in SN

- Per community, best path is to use Workday REST API
- Get wsdl from Workday (? if using SOAP)
- Create new table: Workday New Hire
- System Web Services > Inbound > New Web Service (called "Workday HR Inbound", also creates new import set staging table Workday HR Inbound and transform map)
   * Explore REST API to test
- System Web Services > Outbound > REST Message (Workday HR Outbound)
- Create new Flow "New Hire from Workday"

TODO: 
- Create new Flow "New Hire from Workday"
- Personalize > Security Rules on import set table (need security_admin role)?

Process:
1. Authentication
2. Outbound REST message
3. Scripted REST API or Scheduled Script
