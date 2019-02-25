const urlParams = new URLSearchParams(window.location.search);

const blockHash = urlParams.get('block'),
	signatureHash = urlParams.get('signature');


function updateData() {
	$.ajax({
		url: `/api/getTransaction?block=${blockHash}&signature=${signatureHash}`,
		beforeSend: (xhr) => {
			//xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
		}
	}).done((response) => {

		$('#blockHash').html(blockHash)
		$('#signatureHash').html(signatureHash)
		$('#from').val(response.from)
		$('#to').val(response.to)
		$('#cost').val(response.cost)

	});
}

updateData();