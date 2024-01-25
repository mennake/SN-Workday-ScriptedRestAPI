(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        gs.log('Starting script execution...');
        var restMessage = new sn_ws.RESTMessageV2('Workday HR', 'Default GET');
        var restResponse = restMessage.execute();
        if (restResponse.getStatusCode() !== 200) {
            gs.error('Error ' + restResponse.getStatusCode() + ': ' + restResponse.getErrorMessage());
        }
        var responseBody = restResponse.getBody();
        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(responseBody);
        
        var reportData = xmlDoc.getNode("//wd:Report_Data");
        var reportEntryIterator = reportData.getChildNodeIterator();
        var recordCount = 0;
		
		// create my variables
		var positionID;
		var positionTitle;
		var businessTitle;
		var staffingStatusWID;
		var staffingStatus;
		var jobTitle;
		var timeTypeWID;
		var timeType;
		var managerName;
		var managerWID;
		var managerEmployeeID;
		var legalFirstName;
		var legalLastName;
		var preferredFirstName;
		var preferredLastName;
		var uscID;
		var uscIDWID;
		var employeeID;
		var email;
		var department;
		var costCenter;
		var costCenterID;
		var isSupervisor;
		var workerTypeWID;
		var workerTypeID;

        while (reportEntryIterator.hasNext() && recordCount < 3) {
            var reportEntry = reportEntryIterator.next();
			
            // Log the entry contents for debugging
            gs.info('Report Entry Content:\n' + reportEntry.toString());

			var mappings = [
				{ 
					nodeName: "wd:Staffing_Status", 
					callback: function(entry) { 
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
				
				if (nodeEntry.getNodeName()=="wd:Worker_Type"){
					gs.info("here is worker type");
					gs.info("nodeEntry name " + nodeEntry.getNodeName());
					workerTypeWID = nodeEntry.getFirstChild().getTextContent();
					workerTypeID = nodeEntry.getLastChild().getTextContent();
				}

				
				// Log the node for debugging
				gs.info('Node Content:\n' + nodeEntry.toString());

				// Extract information based on the specific child nodes
				var childNodeIterator = nodeEntry.getChildNodeIterator();
				while (childNodeIterator.hasNext()) {			
					var childNodeEntry = childNodeIterator.next();

					// Log the node for debugging
					gs.info('child Data:\n' + childNodeEntry.toString());
					
					if (childNodeEntry.getNodeName()=="wd:Position_ID"){
						positionID = childNodeEntry.getTextContent();
					}
					if (childNodeEntry.getNodeName()=="wd:Position_Title"){
						positionTitle = childNodeEntry.getTextContent();
					}
					if (childNodeEntry.getNodeName()=="wd:Business_Title"){
						businessTitle = childNodeEntry.getTextContent();
					}
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
					if (childNodeEntry.getNodeName()=="wd:USC_ID"){
						uscID = childNodeEntry.getAttribute('wd:Descriptor');
					}
					
					// Process grandchild nodes
					processGrandchildNodes(childNodeEntry, mappings);


					// Log for debugging
					gs.info('childNodeName: ' + childNodeEntry.getNodeName());
					gs.info('childNodeValue: ' + childNodeEntry.getTextContent());
					
				}

				// Log for debugging
				gs.info('NodeName: ' + nodeEntry.getNodeName());

			}
			
			//gs.info('Count:\n' + recordCount);          					
			// Put it all together
			var gr = new GlideRecord('u_workday_hr_inbound');
			gr.u_position_id = positionID;
			gr.u_position_title = positionTitle;
			gr.u_business_title = businessTitle;
			gr.u_staffing_status = staffingStatus;
			gr.u_staffing_status_wid = staffingStatusWID;
			gr.u_job_title = jobTitle;
			gr.u_time_type = timeType;
			gr.u_time_type_wid = timeTypeWID;
			gr.u_manager_name = managerName;
			gr.u_manager_wid = managerWID;
			gr.u_manager_employee_id = managerEmployeeID;
			gr.u_legal_first_name = legalFirstName;
			gr.u_legal_last_name = legalLastName;
			gr.u_preferred_first_name = preferredFirstName;
			gr.u_preferred_last_name = preferredLastName;
			gr.u_usc_id = uscID;
			gr.u_usc_id_wid = uscIDWID;
			gr.u_employee_id = employeeID;
			gr.u_email = email;
			gr.u_department = department;
			gr.u_cost_center = costCenter;
			gr.u_cost_center_id = costCenterID;
			gr.u_is_supervisor = isSupervisor;
			gr.u_worker_type = workerTypeWID;
			gr.u_worker_type_id = workerTypeID;
			gr.insert();
            recordCount++;
        }

        gs.log('Script execution completed.');
    } catch (e) {
        gs.error('Error occurred: ' + e);
    }
    restResponse.setStatus(200);
    restResponse.setBody('Data inserted successfully.');
})(request, response);

function processGrandchildNodes(childNodeEntry, mappings) {
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
				mapping.callback(grandchildNodeEntry);
			}
			// Debug grandchildren
			gs.info('grandchildNodeName: ' + grandchildNodeEntry.getNodeName());
			gs.info('mappingNodeName: ' + mapping.nodeName);
			gs.info('grandchildNodeValue: ' + grandchildNodeEntry.getTextContent());
			i++;
		}
	}
}
