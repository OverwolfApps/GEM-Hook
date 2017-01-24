$.noty.themes.custom = {
	name    : 'custom',
	helpers : {},
	modal   : {
		css: {
			position       : 'fixed',
			width          : '100%',
			height         : '100%',
			backgroundColor: '#000',
			zIndex         : 10000,
			opacity        : 0.6,
			display        : 'none',
			left           : 0,
			top            : 0
		}
	},
	style   : function() {

		this.$bar.css({
			overflow    : 'hidden',
			margin      : '4px 0',
			borderRadius: '5px'
		});

		this.$message.css({
			fontSize  : '14px',
			lineHeight: '16px',
			textAlign : 'center',
			padding   : '10px',
			width     : 'auto',
			position  : 'relative'
		});

		this.$closeButton.css({
			position  : 'absolute',
			top       : 4, right: 4,
			width     : 10, height: 10,
			background: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAxUlEQVR4AR3MPUoDURSA0e++uSkkOxC3IAOWNtaCIDaChfgXBMEZbQRByxCwk+BasgQRZLSYoLgDQbARxry8nyumPcVRKDfd0Aa8AsgDv1zp6pYd5jWOwhvebRTbzNNEw5BSsIpsj/kurQBnmk7sIFcCF5yyZPDRG6trQhujXYosaFoc+2f1MJ89uc76IND6F9BvlXUdpb6xwD2+4q3me3bysiHvtLYrUJto7PD/ve7LNHxSg/woN2kSz4txasBdhyiz3ugPGetTjm3XRokAAAAASUVORK5CYII=)",
			display   : 'none',
			cursor    : 'pointer'
		});

		this.$buttons.css({
			padding        : 5,
			textAlign      : 'right',
			borderTop      : '1px solid #ccc',
			backgroundColor: '#fff'
		});

		this.$buttons.find('button').css({
			marginLeft: 5
		});

		this.$buttons.find('button:first').css({
			marginLeft: 0
		});

		this.$bar.on({
			mouseenter: function() {
				$(this).find('.noty_close').stop().fadeTo('normal', 1);
			},
			mouseleave: function() {
				$(this).find('.noty_close').stop().fadeTo('normal', 0);
			}
		});

		switch(this.options.layout.name) {
			case 'top':
			case 'topCenter':
			case 'center':
			case 'bottomCenter':
			case 'inline':
				this.$message.css({textAlign: 'center'});
				break;
			case 'topLeft':
			case 'topRight':
			case 'bottomLeft':
			case 'bottomRight':
			case 'centerLeft':
			case 'centerRight':
				this.$message.css({textAlign: 'left'});
				break;
			case 'bottom':
				break;
			default:
				break;
		}

		switch(this.options.type) {
			case 'alert':
				this.$bar.css({backgroundColor: 'rgba(0, 0, 0, 0.9)', color: '#FFF'});
				break;
			case 'notification':
				this.$message.prepend('<i class="fa fa-bell fa-fw"></i> ');
				this.$bar.css({backgroundColor: 'rgba(0, 0, 0, 0.9)', color: '#FFF'});
				break;
			case 'warning':
				this.$message.prepend('<i class="fa fa-exclamation-triangle fa-fw"></i> ');
				this.$bar.css({backgroundColor: 'rgba(255, 235, 168, 0.9)', color: '#FFF'});
				break;
			case 'error':
				this.$message.prepend('<i class="fa fa-times-circle fa-fw"></i> ');
				this.$bar.css({backgroundColor: 'rgba(255, 129, 129, 0.9)', color: '#FFF'});
				break;
			case 'information':
				this.$message.prepend('<i class="fa fa-info-circle fa-fw"></i> ');
				this.$bar.css({backgroundColor: 'rgba(120, 197, 231, 0.9)', color: '#FFF'});
				break;
			case 'success':
				this.$message.prepend('<i class="fa fa-check-circle fa-fw"></i> ');
				this.$bar.css({backgroundColor: 'rgba(183, 245, 188, 0.9)', color: '#FFF'});
				break;
			default:
				this.$bar.css({backgroundColor: 'rgba(0, 0, 0, 0.9)', color: '#FFF'});
				break;
		}
	},
	callback: {
		onShow : function() {

		},
		onClose: function() {

		}
	}
};
