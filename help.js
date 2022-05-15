document.addEventListener('DOMContentLoaded', function(){
	chrome.storage.sync.get({
		noIcon: false
	}, function(items){
		document.getElementById('no-icon').checked = items.noIcon;
	});
	document.getElementById('save-button').addEventListener('click', function(){
		var noIcon = document.getElementById('no-icon').checked;
		chrome.storage.sync.set({
			noIcon: noIcon
		}, function(){
			var status = document.getElementById('status');
			status.textContent = 'Saved';
			setTimeout(function(){
				status.textContent = '';
			}, 888);
	  });
	});
});