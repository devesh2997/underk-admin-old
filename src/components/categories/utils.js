const categories = [
	{
		cid: "men-clothing",
		name: "Men's Clothing",
		slug: "men",
		sku: "MENC",
		parent: ""
	},
	{
		cid: "men-tshirts",
		name: "T-shirts for Men",
		slug: "men-tshirts",
		sku: "MTST",
		parent: "men-clothing"
	},
	{
		cid: "men-full-tshirts",
		name: "Full T-shirts for Men",
		slug: "men-full-tshirts",
		sku: "MFTS",
		parent: "men-tshirts"
	},
	{
		cid: "women-clothing",
		name: "Women's Clothing",
		slug: "women",
		sku: "WMNC",
		parent: ""
	},
	{
		cid: "women-tshirts",
		name: "T-shirts for Women",
		slug: "women-tshirts",
		sku: "WTST",
		parent: "women-clothing"
	},
	{
		cid: "women-full-tshirts",
		name: "Full T-shirts for Women",
		slug: "women-full-tshirts",
		sku: "WFTS",
		parent: "women-tshirts"
	}
];

export const insertDemoCategories = (firebase) => {
	let isConfirmed = window.confirm(
		'Are you sure you want to add demo categories?' +'\n'
		+'Existing categories with same ID will be overwritten.'
	);
	if(isConfirmed) {
		categories.forEach(({ cid, name, slug, sku, parent }, idx) => {
			let ancestors = [];
			let slugFamily = [];
			let parent_category = categories.find(category => category.cid === parent);
			if (parent_category) {
				ancestors = parent_category.ancestors;
				slugFamily = parent_category.slugFamily;
				const { cid, slug, name } = parent_category;
				ancestors.push({
					cid,
					name,
					slug
				});
			}
			slugFamily.push(slug);
			categories[idx].ancestors = ancestors;
			categories[idx].slugFamily = slugFamily;
			
			return firebase.category(cid).set({
				name,
				parent,
				slug,
				sku,
				ancestors,
				slugFamily
			});
		});
	}
};
