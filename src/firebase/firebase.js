import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

import types from 'underk-types'

const config = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_FIREBASE_APP_ID
}
if (process.env.REACT_APP_FIREBASE_MEASUREMENT_ID) {
	config.measurementId = process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
}

// const config_old = {
// 	apiKey: 'AIzaSyBORS5EyMukyl6xO7MCaG1pJNAXw3J0EFc',
// 	authDomain: 'underk-81232.firebaseapp.com',
// 	databaseURL: 'https://underk-81232.firebaseio.com',
// 	projectId: 'underk-81232',
// 	storageBucket: 'underk-81232.appspot.com',
// 	messagingSenderId: '462799589288'
// }

class Firebase {
	constructor () {
		app.initializeApp(config)

		/* Firebase APIs */

		this.auth = app.auth()
		this.db = app.firestore()
		this.storage = app.storage()

		this.googleProvider = new app.auth.GoogleAuthProvider()

		/* Helper */

		this.fieldValue = app.firestore.FieldValue
		this.emailAuthProvider = app.auth.EmailAuthProvider
	}

	// *** Auth API ***

	doCreateUserWithEmailAndPassword = (email, password) =>
		this.auth.createUserWithEmailAndPassword(email, password)

	doSignInWithEmailAndPassword = (email, password) =>
		this.auth.signInWithEmailAndPassword(email, password)

	doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider)

	doSignOut = () => this.auth.signOut()

	doPasswordReset = email => this.auth.sendPasswordResetEmail(email)

	doPasswordUpdate = password =>
		this.auth.currentUser.updatePassword(password)

	doSendEmailVerification = () =>
		this.auth.currentUser.sendEmailVerification({
			url: 'http://localhost:3000'
		})

	// *** Merge Auth and DB User API *** //
	onAuthUserListener = (next, fallback) =>
		this.auth.onAuthStateChanged(authUser => {
			if (authUser) {
				this.admin(authUser.uid)
					.get()
					.then(snapshot => {
						if (snapshot.exists) {
							const dbUser = snapshot.data()
							// default empty roles
							if (!dbUser.roles) {
								dbUser.roles = {}
							}
							// merge auth and db user
							authUser = {
								uid: authUser.uid,
								email: authUser.email,
								emailVerified: authUser.emailVerified,
								providerData: authUser.providerData,
								...dbUser
							}
							next(authUser)
						}
					})
			} else {
				fallback()
			}
		})

	// *** Storage API ***
	productAssetsRef = () => this.storage.ref().child('assets_products')

	// *** User API ***
	user = uid => this.db.doc(`users/${uid}`)
	users = () => this.db.collection('users').orderBy('created_at', 'desc')
	usersWithStartAndEndDate = (startDate, endDate) => {
		startDate = new Date(
			startDate.getFullYear(),
			startDate.getMonth(),
			startDate.getDate()
		)
		let startMilliSecondsSinceEpoch = startDate.getTime()
		endDate = new Date(
			endDate.getFullYear(),
			endDate.getMonth(),
			endDate.getDate() + 1
		)
		let endMilliSecondsSinceEpoch = endDate.getTime()
		console.log(
			'with',
			startMilliSecondsSinceEpoch,
			endMilliSecondsSinceEpoch
		)
		let query = this.db.collection('users')
		query = query
			.where('created_at', '>=', startMilliSecondsSinceEpoch)
			.where('created_at', '<=', endMilliSecondsSinceEpoch)
		return query.orderBy('created_at', 'desc')
	}
	admin = uid => this.db.doc(`admins/${uid}`)
	admins = () => this.db.collection('admins')
	employee = id => this.db.doc(`employees/${id}`)
	employees = () => this.db.collection('employees')

	// *** shortURLs API ***
	shortUrls = () => this.db.collection('short-urls')
	shortUrlForUrl = url =>
		this.db.collection('short-urls').where('redirect', '==', url)
	shortUrl = url => this.db.collection('short-urls').doc(url)
	createShortUrlAction = async (url, trackingEnabled) => {
		const action = await this.db.collection('actions').add({
			type: types.ACTION_SHORTEN_URL,
			url: url,
			adminId: this.auth.currentUser.uid,
			status: types.ACTION_STATUS_INIT,
			trackingEnabled: trackingEnabled
		})
		return action.id
	}

	// *** Addresses API */
	addresses = () => this.db.collection('addresses')
	address = id => this.db.collection('addresses').doc(id)

	//*** Action API */
	actions = () => this.db.collection('actions')
	action = actionId => this.db.collection('actions').doc(actionId)

	// *** type_subtypes API ***
	typesSubtypes = () => this.db.collection('types_subtypes')
	typeSubtypes = type => this.db.collection('types_subtypes').doc(type)

	// *** Category API ***
	category = category_id => this.db.doc(`categories/${category_id}`)
	categories = () => this.db.collection('categories')

	// *** Collection API ***
	collection = collection_id => this.db.doc(`collections/${collection_id}`)
	collections = () => this.db.collection('collections')

	// *** Supplier API ***
	supplier = supplier_id => this.db.doc(`suppliers/${supplier_id}`)
	suppliers = () => this.db.collection('suppliers')

	// *** Product API ***
	product = product_id => this.db.doc(`products/${product_id}`)
	productWithSlug = slug =>
		this.db.collection('products').where('slug', '==', slug)
	productWithSku = sku =>
		this.db
			.collection('products')
			.where('options.skus.' + sku + '.exists', '==', true)
	products = () => this.db.collection('products')
	productsWithCategory = categoryId => {
		let query = this.db.collection('products')
		if (categoryId !== 'all') {
			query = query.where(
				'category.slugFamily',
				'array-contains',
				categoryId
			)
		}
		query = query.orderBy('category.cid')
		return query
	}
	productVariants = product_id =>
		this.db.doc(`products/${product_id}`).collection('variants')

	// *** Inventory API ***
	inventory = () => this.db.collection('inventory')
	inventoryOfProduct = product_id =>
		this.db.collection('inventory').doc(product_id)
	inventoryTransactions = (startDate, endDate) => {
		startDate = new Date(
			startDate.getFullYear(),
			startDate.getMonth(),
			startDate.getDate()
		)
		let startMilliSecondsSinceEpoch = startDate.getTime()
		endDate = new Date(
			endDate.getFullYear(),
			endDate.getMonth(),
			endDate.getDate() + 1
		)
		let endMilliSecondsSinceEpoch = endDate.getTime()
		console.log(
			'with',
			startMilliSecondsSinceEpoch,
			endMilliSecondsSinceEpoch
		)
		let query = this.db.collection('inventory_transactions')
		query = query
			.where('time', '>=', startMilliSecondsSinceEpoch)
			.where('time', '<=', endMilliSecondsSinceEpoch)
		return query.orderBy('time', 'desc')
	}

	// *** Attributes API ***
	attributesAll = () => this.db.collection('attributes')
	attributesOfType = type => this.db.collection('attributes').doc(type)
	clothingAttributes = () => this.db.collection('attributes').doc('CLTH')

	// *** Cart API ***
	cart = uid => this.db.collection('carts').doc(uid)

	// ** Returns API ***
	returnsByDate = (startDate, endDate) => {
		try {
			startDate = new Date(
				startDate.getFullYear(),
				startDate.getMonth(),
				startDate.getDate()
			)
			let startMilliSecondsSinceEpoch = startDate.getTime()
			endDate = new Date(
				endDate.getFullYear(),
				endDate.getMonth(),
				endDate.getDate() + 1
			)
			let endMilliSecondsSinceEpoch = endDate.getTime()
			console.log(
				'with',
				startMilliSecondsSinceEpoch,
				endMilliSecondsSinceEpoch
			)
			let query = this.db.collection('returns')
			query = query
				.where(
					'lastRequestCreatedOn',
					'>=',
					startMilliSecondsSinceEpoch
				)
				.where('lastRequestCreatedOn', '<=', endMilliSecondsSinceEpoch)
			return query.orderBy('lastRequestCreatedOn', 'desc')
		} catch (error) {
			console.log(error)
			return null
		}
	}

	// *** Custom Orders API ***
	customOrdersByDate = (startDate, endDate) => {
		try {
			startDate = new Date(
				startDate.getFullYear(),
				startDate.getMonth(),
				startDate.getDate()
			)
			let startMilliSecondsSinceEpoch = startDate.getTime()
			endDate = new Date(
				endDate.getFullYear(),
				endDate.getMonth(),
				endDate.getDate() + 1
			)
			let endMilliSecondsSinceEpoch = endDate.getTime()
			console.log(
				'with',
				startMilliSecondsSinceEpoch,
				endMilliSecondsSinceEpoch
			)
			let query = this.db.collection('custom_orders')
			query = query
				.where('time', '>=', startMilliSecondsSinceEpoch)
				.where('time', '<=', endMilliSecondsSinceEpoch)
			return query.orderBy('time', 'desc')
		} catch (error) {
			console.log(error)
			return null
		}
	}

	// *** Orders API ***
	ordersByStatusAndDateAndPaymentMode = (
		status,
		startDate,
		endDate,
		paymentMode
	) => {
		try {
			startDate = new Date(
				startDate.getFullYear(),
				startDate.getMonth(),
				startDate.getDate()
			)
			let startMilliSecondsSinceEpoch = startDate.getTime()
			endDate = new Date(
				endDate.getFullYear(),
				endDate.getMonth(),
				endDate.getDate() + 1
			)
			let endMilliSecondsSinceEpoch = endDate.getTime()
			console.log(
				'with',
				status,
				startMilliSecondsSinceEpoch,
				endMilliSecondsSinceEpoch
			)
			let query = this.db.collection('orders')
			if (status !== 'all') {
				query = query.where('status', '==', status)
			}
			if (paymentMode !== 'all') {
				query = query.where('payment.mode', '==', paymentMode)
			}
			query = query
				.where('time', '>=', startMilliSecondsSinceEpoch)
				.where('time', '<=', endMilliSecondsSinceEpoch)
			return query.orderBy('time', 'desc')
		} catch (error) {
			console.log(error)
			return null
		}
	}
	order = oid => this.db.collection('orders').doc(oid)
	orders = () => this.db.collection('orders').orderBy('time', 'desc')
	ordersByUser = uid =>
		this.db
			.collection('orders')
			.where('uid', '==', uid)
			.orderBy('time', 'desc')
	ordersByStatus = status =>
		this.db
			.collection('orders')
			.where('status', '==', status)
			.orderBy('time', 'desc')
	placedOrders = () =>
		this.db
			.collection('orders')
			.where('status', '==', 'placed')
			.orderBy('time', 'desc')
	createdOrders = () =>
		this.db
			.collection('orders')
			.where('status', '==', 'created')
			.orderBy('time', 'desc')

	//* ** Strategies API */
	strategies = () => this.db.collection('strategies').doc('strategies')

	//*** Landing Widgets API */
	landingWidgets = () =>
		this.db.collection('landing_widgets').orderBy('priority')
	landingWidget = id => this.db.collection('landing_widgets').doc(id)
	landingWidgetsAssetsRef = () => this.storage.ref().child('assets_landing')

	// *** emails API */
	emails = () => this.db.collection('mail')
	emailsWithStartAndEndDate = (startDate, endDate) => {
		try {
			startDate = new Date(
				startDate.getFullYear(),
				startDate.getMonth(),
				startDate.getDate()
			)
			let startMilliSecondsSinceEpoch = startDate.getTime()
			endDate = new Date(
				endDate.getFullYear(),
				endDate.getMonth(),
				endDate.getDate() + 1
			)
			let endMilliSecondsSinceEpoch = endDate.getTime()
			let query = this.db.collection('mail')
			query = query
				.where('time', '>=', startMilliSecondsSinceEpoch)
				.where('time', '<=', endMilliSecondsSinceEpoch)
			return query.orderBy('time', 'desc')
		} catch (error) {
			console.log(error)
			return null
		}
	}

	// ** sms Api **
	sms = () => this.db.collection('sms')
	smsWithStartAndEndDate = (startDate, endDate) => {
		try {
			startDate = new Date(
				startDate.getFullYear(),
				startDate.getMonth(),
				startDate.getDate()
			)
			let startMilliSecondsSinceEpoch = startDate.getTime()
			endDate = new Date(
				endDate.getFullYear(),
				endDate.getMonth(),
				endDate.getDate() + 1
			)
			let endMilliSecondsSinceEpoch = endDate.getTime()
			let query = this.db.collection('sms')
			query = query
				.where('time', '>=', startMilliSecondsSinceEpoch)
				.where('time', '<=', endMilliSecondsSinceEpoch)
			return query.orderBy('time', 'desc')
		} catch (error) {
			console.log(error)
			return null
		}
	}

	coupon = cid => this.db.collection('coupons').doc(cid)
	coupons = () => this.db.collection('coupons')
	couponsWithStartAndEndDate = (startDate, endDate) => {
		try {
			startDate = new Date(
				startDate.getFullYear(),
				startDate.getMonth(),
				startDate.getDate()
			)
			let startMilliSecondsSinceEpoch = startDate.getTime()
			endDate = new Date(
				endDate.getFullYear(),
				endDate.getMonth(),
				endDate.getDate() + 1
			)
			let endMilliSecondsSinceEpoch = endDate.getTime()
			let query = this.coupons()
			query = query
				.where('startTime', '>=', startMilliSecondsSinceEpoch)
				.where('startTime', '<=', endMilliSecondsSinceEpoch)
			return query.orderBy('startTime', 'desc').orderBy('endTime', 'desc')
		} catch (error) {
			console.log(error)
			return null
		}
	}

	description = id => this.db.collection('descriptions').doc(id)
	descriptions = () => this.db.collection('descriptions')
}

export default Firebase
