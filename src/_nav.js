import ROUTES from './routes';

export default {
	items: [
		{
			name: 'Dashboard',
			url: ROUTES.DASHBOARD.path,
			icon: 'icon-speedometer',
		},
		{
			name: 'Administrators',
			url: ROUTES.ADMINISTRATOR_LIST.path,
			icon: 'fa fa-user-secret',
			children: [
				{
					name: 'Administrator List',
					url: ROUTES.ADMINISTRATOR_LIST.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Add administrator',
					url: ROUTES.ADD_ADMINISTRATOR.path,
					icon: 'fa fa-user-plus',
				},
			],
		},
	],
};



// {
// 	title: true,			// title
// 	name: '',
// 	wrapper: {				// optional wrapper object
// 		element: '',		// required valid HTML5 element tag
// 		attributes: {}		// optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
// 	},
// 	class: ''				// optional class names space delimited list for title item ex: "text-center"
// },

// {
// 	name: '',				// nav-item with badge
// 	url: '',
// 	icon: '',				// flag-icon-css, font-awesome, simple-line-icons
// 	badge: {
// 		variant: '',		// colors - as mentioned in src/views/Theme/Colors/Colors.js
// 		text: '',
// 	},
// },

// {
// 	name: '',				// nav-item with children
// 	url: '',
// 	icon: '',
// 	children: [
// 		{
// 			name: '',
// 			url: '',
// 			icon: '',
// 		},
// 	],
// },

// {
// 	divider: true,			// divider
// },
