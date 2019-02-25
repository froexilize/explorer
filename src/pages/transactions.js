const urlParams = new URLSearchParams(window.location.search);

var table = new Tabulator("#table-container", {
	data: [],
	layout:"fitColumns",
	responsiveLayout: "hide",
	tooltips:true,
	addRowPos:"top",
	pagination:"local",
	paginationSize: 15,
	movableColumns:true,
	initialSort:[
		{column:"name", dir:"asc"},
	],
	columns: [
		{title: "Signature", field: "signature", width: '80%'},
		{title: "Cost", field: "cost"},
	],
	rowClick: (e, row) => {
    	var signatureHash = row.getData().signature,
    		blockHash = urlParams.get('block');
    	window.location.replace(`/transaction?block=${blockHash}&signature=${signatureHash}`);
    }
});

updateTableData();
$('#hashInfo').val(urlParams.get('block'))

$('.offset input').on('change', updateTableData)

function updateTableData() {

	const offset = $('.offset input').val(),
		blockHash = urlParams.get('block');

	$.ajax({
		url: `/api/getTransactions?offset=${offset}&limit=20&block=${blockHash}`,
		beforeSend: (xhr) => {
			//xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
		}
	}).done((response) => {

		var data = response.map(item => { 
			return { id: item.signature, signature: item.signature, cost: item.cost }
		})

		table.setData(data);
		//console.log(data)
	});
}