import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const OrdersList = React.lazy(() => import('./components/orders'));
const InventoryTransactionsList = React.lazy(() => import('./components/inventory/transactions-list'));
const Inventory = React.lazy(() => import('./components/inventory'));
const AdminList = React.lazy(() => import('./components/administrators/administrator-list'));
const AddAdminItem = React.lazy(() => import('./components/administrators/add-administrator'));
const AdminItem = React.lazy(() => import('./components/administrators/administrator-item'));
const UserList = React.lazy(() => import('./components/users/user-list'));
const UserItem = React.lazy(() => import('./components/users/user-item'));
const CategoryList = React.lazy(() => import('./components/categories/category-list'));
const CategoriesBulkUpload = React.lazy(()=> import('./components/categories/bulk-upload'))
const AddCategoryItem = React.lazy(() => import('./components/categories/add-category'));
const CategoryItem = React.lazy(() => import('./components/categories/category-item'));
const SupplierList = React.lazy(() => import('./components/suppliers/supplier-list'));
const AddSupplierItem = React.lazy(() => import('./components/suppliers/add-supplier'));
const SupplierItem = React.lazy(() => import('./components/suppliers/supplier-item'));
const ProductsHome = React.lazy(() => import('./components/products/products-home'));
const ProductList = React.lazy(() => import('./components/products/product-list'));
const AddProductItem = React.lazy(() => import('./components/products/add-product'));
const BulkUpload = React.lazy(()=>import('./components/products/bulk-upload/index'));
const EditProductItem = React.lazy(() => import('./components/products/edit-product'));
const AttributeList = React.lazy(() => import('./components/products/attributes/attribute-list'));
const AttributesBulkUpload = React.lazy(()=>import('./components/products/attributes/bulk-upload'))
const AddAttribute = React.lazy(() => import('./components/products/attributes/add-attribute'));
const CollectionList = React.lazy(() => import('./components/products/collections/collection-list'));
const CollectionsBulkUpload = React.lazy(()=>import('./components/products/collections/bulk-upload'))
const AddCollection = React.lazy(() => import('./components/products/collections/add-collection'));
const Strategies = React.lazy(()=>import('./components/strategies'));
const MobileHomeWidgetsManager = React.lazy(()=>import('./components/mobile-home-widgets'));
const ProductItem = React.lazy(()=>import('./components/products/product-item'));

const TempDashboard = () => {
	return <span>Dashboard</span>;
}

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = {
	HOME: {
		path: '/',
		exact: true,
		name: 'Home'
	},
	DASHBOARD: {
		path: '/dashboard',
		name: 'Dashboard',
		component: TempDashboard
	},
	STRATEGIES: {
		path: '/strategies',
		name: 'Strategies',
		component: Strategies
	},
	HOME_WIDGETS: {
		path: '/landing-widgets',
		name: 'Home Widgets',
		component: MobileHomeWidgetsManager
	},
	ORDERS: {
		path: '/orders',
		exact: true,
		name: 'Orders',
		component: OrdersList
	},
	INVENTORY: {
		path: '/inventory',
		exact: true,
		name: 'Inventory',
		component: Inventory
	},
	INVENTORY_TRANSACTIONS: {
		path: '/inventory/transactions',
		exact: true,
		name: 'Inventory Transactions',
		component: InventoryTransactionsList
	},
	ADMINISTRATOR_LIST: {
		path: '/administrators',
		exact: true,
		name: 'Administrators',
		component: AdminList,
	},
	ADD_ADMINISTRATOR: {
		path: '/administrators/add',
		exact: true,
		name: 'Add Administrator',
		component: AddAdminItem,
	},
	ADMINISTRATOR_DETAILS: {
		path: '/administrators/:id',
		exact: true,
		name: 'Administrator Details',
		component: AdminItem,
	},
	USER_LIST: {
		path: '/users',
		exact: true,
		name: 'Users',
		component: UserList,
	},
	USER_DETAILS: {
		path: '/users/:id',
		exact: true,
		name: 'User Details',
		component: UserItem,
	},
	CATEGORY_LIST: {
		path: '/categories',
		exact: true,
		name: 'Categories',
		component: CategoryList,
	},
	CATEGORIES_BULK_UPLOAD: {
		path: '/categories/bulk',
		exact: true,
		name: 'Categories Bulk Upload',
		component: CategoriesBulkUpload,
	},
	ADD_CATEGORY: {
		path: '/categories/add',
		exact: true,
		name: 'Add Category',
		component: AddCategoryItem,
	},
	CATEGORY_DETAILS: {
		path: '/categories/:cid',
		exact: true,
		name: 'Category Details',
		component: CategoryItem,
	},
	SUPPLIER_LIST: {
		path: '/suppliers',
		exact: true,
		name: 'Suppliers',
		component: SupplierList,
	},
	ADD_SUPPLIER: {
		path: '/suppliers/add',
		exact: true,
		name: 'Add Supplier',
		component: AddSupplierItem,
	},
	SUPPLIER_DETAILS: {
		path: '/suppliers/:sid',
		exact: true,
		name: 'Supplier Details',
		component: SupplierItem,
	},
	PRODUCTS_HOME: {
		path: '/products',
		exact: true,
		name: 'Products',
		component: ProductsHome,
	},
	PRODUCT_LIST: {
		path: '/products/list',
		exact: true,
		name: 'Products',
		component: ProductList,
	},
	ATTRIBUTE_LIST: {
		path: '/products/attributes',
		exact: true,
		name: 'Attributes',
		component: AttributeList,
	},
	ATTRIBUTES_BULK_UPLOAD: {
		path: '/products/attributes/bulk',
		exact: true,
		name: 'Bulk Upload Attributes',
		component: AttributesBulkUpload,
	},
	ADD_ATTRIBUTE: {
		path: '/products/attributes/add',
		exact: true,
		name: 'Add Collection',
		component: AddAttribute,
	},
	COLLECTION_LIST: {
		path: '/products/collections',
		exact: true,
		name: 'Collections',
		component: CollectionList,
	},
	COLLECTIONS_BULK_UPLOAD: {
		path: '/products/collections/bulk',
		exact: true,
		name: 'Bulk Upload Collections',
		component: CollectionsBulkUpload,
	},
	ADD_COLLECTION: {
		path: '/products/collections/add',
		exact: true,
		name: 'Add Collection',
		component: AddCollection,
	},
	ADD_PRODUCT: {
		path: '/products/add',
		exact: true,
		name: 'Add Product',
		component: AddProductItem,
	},
	BULK_UPLOAD: {
		path: '/products/bulk',
		exact: true,
		name: 'Bulk Upload Products',
		component: BulkUpload,
	},
	PRODUCT_DETAILS: {
		path: '/products/:pid',
		exact: true,
		name: 'Product Details',
		component: ProductItem,
	},
	EDIT_PRODUCT: {
		path: '/products/:pid/edit',
		exact: true,
		name: 'Edit Product',
		component: EditProductItem,
	},
};

export default routes;
