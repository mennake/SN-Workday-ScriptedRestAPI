//(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        gs.log('Starting script execution...');
		gs.log('This is a scheduled job...');
        var restMessage = new sn_ws.RESTMessageV2('Workday HR', 'Default GET');
        var restResponse = restMessage.execute();
        if (restResponse.getStatusCode() !== 200) {
            gs.error('Error ' + restResponse.getStatusCode() + ': ' + restResponse.getErrorMessage());
        }
        var responseBody = restResponse.getBody();
        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(responseBody);
		
		// Log the entire XML for testing
		// logXML(xmlDoc);
     
        var reportData = xmlDoc.getNode("//wd:Report_Data");
		
        var reportEntryIterator = reportData.getChildNodeIterator();
        var recordCount = 0;
							
 
        while (reportEntryIterator.hasNext()) {
        //while (reportEntryIterator.hasNext() && recordCount < 1835) {
            // Reset variables for each iteration
            var positionID = null;
            var positionTitle = null;
            var businessTitle = null;
            var staffingStatusWID = null;
            var staffingStatus = null;
            var jobTitle = null;
            var timeTypeWID = null;
            var timeType = null;
            var managerName = null;
            var managerWID = null;
            var managerEmployeeID = null;
            var hiringManagerName = null;
            var hiringManagerWID = null;
            var hiringManagerEmployeeID = null;
            var legalFirstName = null;
            var legalLastName = null;
            var preferredFirstName = null;
            var preferredLastName = null;
            var uscID = null;
            var uscIDWID = null;
            var employeeID = null;
            var email = null;
            var department = null;
            var costCenter = null;
            var costCenterID = null;
            var isSupervisor = null;
            var workerTypeWID = null;
            var workerTypeID = null;

            var reportEntry = reportEntryIterator.next();
			
            gs.info('Report Entry Content:\n' + reportEntry.toString());

            var mappings = [
                    { 
                        nodeName: "wd:Staffing_Status", 
                        callback: function(entry, positionChildNodeEntry) { 
                            var idType = entry.getAttribute('wd:type');
                            var idValue = entry.getTextContent();
                            if (idType == "WID") {
                                staffingStatusWID = idValue;
                            }
                            else {
                                staffingStatus = idValue;
                            }
                        }
                    },
                    { 
                        nodeName: "wd:Time_Type", 
                        callback: function(entry) { 
                            var idType = entry.getAttribute('wd:type');
                            var idValue = entry.getTextContent();
                            if (idType == "WID") {
                                timeTypeWID = idValue;
                            }
                            else {
                                timeType = idValue;
                            }
                        }
                    },
                    { 
                        nodeName: "wd:Manager", 
                        callback: function(entry) { 
                            var idType = entry.getAttribute('wd:type');
                            var idValue = entry.getTextContent();
                            if (idType == "WID") {
                                managerWID = idValue;
                            }
                            else {
                                managerEmployeeID = idValue;
                            }
                        }
                    },
                    { 
                        nodeName: "wd:Hiring_Manager", 
                        callback: function(entry) { 
                            var idType = entry.getAttribute('wd:type');
                            var idValue = entry.getTextContent();
                            if (idType == "WID") {
                                hiringManagerWID = idValue;
                            }
                            else {
                                hiringManagerEmployeeID = idValue;
                            }
                        }
                    },
                    { 
                        nodeName: "wd:USC_ID", 
                        callback: function(entry) { 
                            var idType = entry.getAttribute('wd:type');
                            var idValue = entry.getTextContent();
                            if (idType == "WID") {
                                uscIDWID = idValue;
                            }
                        }
                    },

            ];

            // Extract information based on the specific child nodes
            var nodeEntryIterator = reportEntry.getChildNodeIterator();
            while (nodeEntryIterator.hasNext()) {			
                var nodeEntry = nodeEntryIterator.next();
                var positionNode = nodeEntry.getNodeName()=="wd:Position";
                var workerNode = nodeEntry.getNodeName()=="wd:Worker"
                var workerTypeNode = nodeEntry.getNodeName()=="wd:Worker_Type";
                
                // Log the node for debugging
                gs.info('Node Content:\n' + nodeEntry.toString());
                
                if (workerTypeNode){
                    gs.info("here is worker type");
                    gs.info("nodeEntry name " + nodeEntry.getNodeName());
                    workerTypeWID = nodeEntry.getFirstChild().getTextContent();
                    workerTypeID = nodeEntry.getLastChild().getTextContent();
                }

                if (positionNode){
                    // Extract information based on the specific child nodes
                    var positionChildNodeIterator = nodeEntry.getChildNodeIterator();
                    while (positionChildNodeIterator.hasNext()) {			
                        var positionChildNodeEntry = positionChildNodeIterator.next();

                        // Log the node for debugging
                        gs.info('position child Data:\n' + positionChildNodeEntry.toString());

                                                
                        if (positionChildNodeEntry.getNodeName()=="wd:Position_ID"){
                            positionID = positionChildNodeEntry.getTextContent();
                        }
                        if (positionChildNodeEntry.getNodeName()=="wd:Position_Title"){
                            positionTitle = positionChildNodeEntry.getTextContent();
                        }
                        if (positionChildNodeEntry.getNodeName()=="wd:Business_Title"){
                            businessTitle = positionChildNodeEntry.getTextContent();
                        }

                        // Process grandchild nodes
                        processGrandchildNodes(positionChildNodeEntry, mappings);

                    }
                }

                if (workerNode){
                    // Extract information based on the specific child nodes
                    var childNodeIterator = nodeEntry.getChildNodeIterator();
                    while (childNodeIterator.hasNext()) {			
                        var childNodeEntry = childNodeIterator.next();

                        // Log the node for debugging
                        gs.info('worker child Data:\n' + childNodeEntry.toString());
                        
                        if (childNodeEntry.getNodeName()=="wd:Job_Title"){
                            jobTitle = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Legal_Name_First"){
                            legalFirstName = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Legal_Name_Last"){
                            legalLastName = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Preferred_Name_First"){
                            preferredFirstName = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Preferred_Name_Last"){
                            preferredLastName = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Employee_ID"){
                            employeeID = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Primary_Work_Email"){
                            email = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Department_Name"){
                            department = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Cost_Center_Name"){
                            costCenter = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Cost_Center_ID"){
                            costCenterID = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Is_Supervisor"){
                            isSupervisor = childNodeEntry.getTextContent();
                        }
                        if (childNodeEntry.getNodeName()=="wd:Manager"){
                            managerName = childNodeEntry.getAttribute('wd:Descriptor');
                        }
                        if (childNodeEntry.getNodeName()=="wd:Hiring_Manager"){
                            hiringManagerName = childNodeEntry.getAttribute('wd:Descriptor');
                        }
                        if (childNodeEntry.getNodeName()=="wd:USC_ID"){
                            uscID = childNodeEntry.getAttribute('wd:Descriptor');
                        }
                        
                        // Process grandchild nodes
                        processGrandchildNodes(childNodeEntry, mappings);


                        // Log for debugging
                        gs.info('childNodeName: ' + childNodeEntry.getNodeName());
                        gs.info('childNodeValue: ' + childNodeEntry.getTextContent());
                        
                    }
                }

                // Log for debugging
                gs.info('NodeName: ' + nodeEntry.getNodeName());

            }
                
            //gs.info('Count:\n' + recordCount);          					
            // Put it all together
            var gr = new GlideRecord('u_workday_hr_inbound');
            // Set field values only if they are not empty
            setIfNotEmpty(gr, 'u_position_id', positionID);
            setIfNotEmpty(gr, 'u_position_title', positionTitle);
            setIfNotEmpty(gr, 'u_business_title', businessTitle);
            setIfNotEmpty(gr, 'u_staffing_status', staffingStatus);
            setIfNotEmpty(gr, 'u_staffing_status_wid', staffingStatusWID);
            setIfNotEmpty(gr, 'u_job_title', jobTitle);
            setIfNotEmpty(gr, 'u_time_type', timeType);
            setIfNotEmpty(gr, 'u_time_type_wid', timeTypeWID);
            setIfNotEmpty(gr, 'u_manager_name', managerName);
            setIfNotEmpty(gr, 'u_manager_wid', managerWID);
            setIfNotEmpty(gr, 'u_manager_employee_id', managerEmployeeID);
            setIfNotEmpty(gr, 'u_hiring_manager_name', hiringManagerName);
            setIfNotEmpty(gr, 'u_hiring_manager_wid', hiringManagerWID);
            setIfNotEmpty(gr, 'u_hiring_manager_employee_id', hiringManagerEmployeeID);
            setIfNotEmpty(gr, 'u_legal_first_name', legalFirstName);
            setIfNotEmpty(gr, 'u_legal_last_name', legalLastName);
            setIfNotEmpty(gr, 'u_preferred_first_name', preferredFirstName);
            setIfNotEmpty(gr, 'u_preferred_last_name', preferredLastName);
            setIfNotEmpty(gr, 'u_usc_id', uscID);
            setIfNotEmpty(gr, 'u_usc_id_wid', uscIDWID);
            setIfNotEmpty(gr, 'u_employee_id', employeeID);
            setIfNotEmpty(gr, 'u_email', email);
            setIfNotEmpty(gr, 'u_department', department);
            setIfNotEmpty(gr, 'u_cost_center', costCenter);
            setIfNotEmpty(gr, 'u_cost_center_id', costCenterID);
            setIfNotEmpty(gr, 'u_is_supervisor', isSupervisor);
            setIfNotEmpty(gr, 'u_worker_type', workerTypeWID);
            setIfNotEmpty(gr, 'u_worker_type_id', workerTypeID);
            gr.insert();
            recordCount++;
        }


        gs.log('Script execution completed.');
		gs.log('The scheduled job worked.');
    } catch (e) {
        gs.error('Error occurred with this scheduled job: ' + e);
    }
    restResponse.setStatus(200);
    restResponse.setBody('Data inserted successfully.');
//})(request, response);


// Function to log the entire XML for testing
function logXML(node) {
    var xmlString = node.toString();
    gs.info('XML Content:\n' + xmlString);
}

function setIfNotEmpty(record, fieldName, value) {
    if (value) {
        record[fieldName] = value;
    }
}
function processGrandchildNodes(childNodeEntry, mappings, positionChildNodeEntry) {
    var grandchildNodeIterator = childNodeEntry.getChildNodeIterator();
    while (grandchildNodeIterator.hasNext()) {
        var grandchildNodeEntry = grandchildNodeIterator.next();

        // Log the node for debugging
        gs.info('grandchild Data:\n' + grandchildNodeEntry.toString());

        var i = 0;
        while (i < mappings.length) {
            var mapping = mappings[i];
            if (childNodeEntry.getNodeName() == mapping.nodeName) {
                gs.info('Debug: Mapping found - invoking callback');
                mapping.callback(grandchildNodeEntry, positionChildNodeEntry); // Pass positionChildNodeEntry
            }
            // Debug grandchildren
            gs.info('grandchildNodeName: ' + grandchildNodeEntry.getNodeName());
            gs.info('mappingNodeName: ' + mapping.nodeName);
            gs.info('grandchildNodeValue: ' + grandchildNodeEntry.getTextContent());
            i++;
        }
    }
}

