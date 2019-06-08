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
					name: 'Add Administrator',
					url: ROUTES.ADD_ADMINISTRATOR.path,
					icon: 'fa fa-user-plus',
				},
			],
		},
		{
			name: 'Users',
			url: ROUTES.USER_LIST.path,
			icon: 'fa fa-users',
		},
		{
			name: 'Categories',
			url: ROUTES.CATEGORY_LIST.path,
			icon: 'fa fa-th-large',
			children: [
				{
					name: 'Category List',
					url: ROUTES.CATEGORY_LIST.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Add Category',
					url: ROUTES.ADD_CATEGORY.path,
					icon: 'fa fa-plus',
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
