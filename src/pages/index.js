var table = new Tabulator("#table-container", {
	data: [],
	layout:"fitColumns",
	responsiveLayout: "hide",
	tooltips:true,
	addRowPos:"top",
	movableColumns:true,
	initialSort:[
		{column:"name", dir:"asc"},
	],
	columns:[
		{ title: "Block hash", field: "block", width: '80%'},
		{ title: "Transactions count", field: "transactionsCount"},
	],
	rowClick: (e, row) => {
    	var blockHash = row.getData().block;
    	window.location.replace(`/transactions?block=${blockHash}`);
    }
});

updateTableData();
updateCountersData();

setInterval(() => {
	updateTableData();
	updateCountersData();
}, 1000)

function updateTableData() {

	var offset = $('.offset input').val();

	$.ajax({
		url: `/api/getBlocks?offset=${offset}&limit=20`,
		beforeSend: (xhr) => {
			//xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
		}
	}).done((response) => {

		var data = response.map(item => { 
			return { id: item.block, block: item.block, transactionsCount: item.transactionsCount }
		})

		table.setData(data);
		//console.log(data)
	});
}

function updateCountersData() {
	$.ajax({
		url: "/api/getCounters",
		beforeSend: (xhr) => {
			//xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
		}
	}).done((response) => {

		$('#blocksCount').html(response.blocks)
		$('#transactionsCount').html(response.transactions)
	});
}