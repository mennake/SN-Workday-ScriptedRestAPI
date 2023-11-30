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
		var reportList = xmlDoc.getFirstNode("//wd:Report_Data");
		var reportEntries = reportList.getChildNodeIterator();
		while (reportEntries.hasNext()) {
		//for (var i = 0; i < reportEntries.getLength(); i++) {
			var reportEntry = reportEntries.next();
			var positionNode = reportEntry.getFirstChild('wd:Positions');
			var positionNameNode = positionNode.getFirstChild('wd:Position_Name');
			var positionIDNode = positionNode.getLastChild('wd:Position_ID');

			var positionName = positionNameNode.getTextContent();
			var positionID = positionIDNode.getTextContent();
			var gr = new GlideRecord('u_workday_hr_inbound');
			gr.u_position_name = positionName;
			gr.u_position_id = positionID;
			gr.insert();
		}
		gs.log('Script execution completed.');
	} catch (e) {
		gs.error('Error occurred: ' + e);
	}
	restResponse.setStatus(200);
	restResponse.setBody('Data inserted successfully.');
})(request, response);
