/** Form Handler for @Markojs
 * 
 * @version 1.0.0
 * @author Fabrice Marlboro
 * @date 15/04/2021
 * @repository https://github.com/fabrice8/markojs-form
 * 
 * @params options (Object)
 * 		- key: <string> Scope identifier key of the form Element in the component
 * 		- autosave: <true|false> Put the form on auto-save mode while the user is filling it.
 * 		- crosscheck: <true|false> Re-test the validation patterns of each inputs in the form before submission
 * 
 * @Dependencies
 * 		- UIStore Plugin for the auto-save feature. Check https://github.com/fabrice8/all-localstorage
 */
import UIStore from 'all-localstorage'

function Patterns(){
	
	const
	self = this,
	PredefineList = {
			required: value => { return /[a-zA-Z0-9]/.test( value ) },

	domain: value => { return /^((http(s?)|ftp):\/\/)?[\w-]+(\.[\w-]+)/i.test( value ) },
	url: value => { return /^((http(s?)|ftp):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/i.test( value ) },
	email: value => { return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/i.test( value ) },

	phone: value => { return self.number && /\d{7,}|(\d{2,} ) => {3,}/.test( value ) },

	fullname: value => { return /\s+/.test( value ) },

	password: ( value, type ) => {
		// validate a string words
		let TYPES = { weak: 1, medium: 2, strong: 3, perfect: 4 },
				stars = 0,
				status

		// Determine the level of password
		if( /(?=.*[a-z].*[a-z].*[a-z])/.test( value ) ) stars++ // required string characters

		if( /(?=.*[!@#$&*])/.test( value ) ) stars++ // required at least one special characters

		if( /(?=.*[A-Z].*[A-Z])/.test( value ) ) stars++ // required at least one capital characters

		if( /(?=.*[0-9].*[0-9])/.test( value ) ) stars++ // required numbers

		if( /.{12,20}/.test( value ) ) stars += 2  // should length between 12 - 20 characters as long and strong password

		else if( /.{8,12}/.test( value ) ) stars++ // should length between 8 - 12 characters as standard

		// Redable password status
		if( stars >= 0 && stars < 2 ) status = { type: 'weak', indice: 1 }
		else if( stars >= 2 && stars < 4 ) status = { type: 'medium', indice: 2 }
		else if( stars >= 4 && stars < 6 ) status = { type: 'strong', indice: 3 }
		else if( stars >= 6 ) status = { type: 'perfect', indice: 4 }

		return TYPES.hasOwnProperty( type ) && TYPES[ type ] <= status.indice
	},

	number: value => { return typeof value == 'number' || Number( value ) !== null },
	boolean: value => { return typeof value == 'boolean' },
	array: value => { return Array.isArray( value ) },
	object: value => { return typeof value == 'object' && !Array.isArray( value ) },

	lowercase: value => { return value.toLowerCase() == value },
	uppercase: value => { return value.toUpperCase() == value },

	length: ( value, size ) => { return value.length == parseInt( size ) },
	minLength: ( value, size ) => { return value.length >= parseInt( size ) },
	maxLength: ( value, size ) => { return value.length <= parseInt( size ) }
	},
	CustomList = {}

	function extraSet( str ){
		let combines = str.split(/\s*:\s*/)
		return combines.length == 2 ? combines : [ str, false ]
	}

	function Testor( value, pattern, def ){

		// Pattern validator not found
		if( !PredefineList.hasOwnProperty( pattern )
				&& !CustomList.hasOwnProperty( pattern ) )
			return false

		return ( PredefineList.hasOwnProperty( pattern )
				&& PredefineList[ pattern ]( value, def ) ) // Pre-defiined pattern test
							|| ( CustomList.hasOwnProperty( pattern )
								&& new RegExp( CustomList[ pattern ] ).test( value ) ) // Custom patterns test
	}

	this.add = ( name, regexp ) => CustomList[ name ] = regexp

	this.has = pattern => {
		// Check a defined pattern: Predefine or custom
		return PredefineList.hasOwnProperty( pattern ) || CustomList.hasOwnProperty( pattern )
	}

	this.test = ( sequence, value ) => {

		// OR composed pattern
		if( /\|/.test( sequence ) ){
			const results = sequence.split(/\s*\|\s*/).map( each => { return self.test( each, value ) } )
			return results.includes( true )
		}

		// Single or AND pattern
		if( /\s+/.test( sequence ) )
			return self.multiTest( sequence.split(/\s+/g), value ) // pattern of multiple different type of value possible

		else {
			let [ def ] = extraSet( sequence )
			return Testor( value, sequence, def )
		}
	}

	this.multiTest = ( sequenceList, value, extra ) => {
		// handle inputs that can have multiple different type of value possible
		// Can have: Email or phone or date or ...
		let state = false
		// test if the value correspond to one of the type of the list
		if( sequenceList.length )
			for( let o = 0; o < sequenceList.length; o++ ){
				let [ pattern, def ] = extraSet( sequenceList[o] )

				if( !Testor( value, pattern, def ) ){
					state = false
					break
				}
				else state = true
			}

		return state
	}
}

function getAttributes( inputs, type ){

	const element = inputs.pop()
	let value, name, pattern

	// Standard HTML Element
	if( typeof element.getAttribute == 'function' ){
		value = element.getAttribute('type') == 'number' ? parseInt( element.value ) : element.value,
		name = element.getAttribute('name'),
		pattern = element.getAttribute('validate')
	}
	// Markojs component
	else {
		value = inputs.pop() || element.input.value,
		name = element.input.name,
		pattern = element.input.validate
	}

	switch( type ){

		case 'checked': value = element.checked; break

	}

	return { value, name, pattern }
}

function subSet( obj, link, data ){

	const
	nsp = link.split('.'),
	toCheck = nsp.shift()

	if( !obj.hasOwnProperty( toCheck ) && nsp.length )
		obj[ toCheck ] = {}

	if( typeof obj == 'object' && nsp.length ){
		obj = obj[ toCheck ]
		return subSet( obj, nsp.join('.'), data )
	}

	obj[ toCheck ] = data
	return true
}

let PEvents = [ 'bind', 'unbind', 'input', 'error', 'fill', 'autosave', 'reset' ]

/* Initialize the UI Store plugin */
const autofillStore = new UIStore({ prefix: 'fh--auto-fill', encrypt: true })

function FormHandler( options ){
	
	const
	self = this,
	defaultOptions = {
		autosave: false, // Auto-save form while filling
		crosscheck: true // Cross check validation pattern at submission
	},
  Events = {}

	// Merge defined options with the default set.
	this.options = Object.assign( {}, defaultOptions, options || {} )

	// Auto-load saved data of this form
	let savedData
	if( this.options.autosave ){
		if( !this.options.key )
			throw new Error('[FormHandler] Undefined Form Key Identifier. Required for Auto-Save')

		if( autofillStore )
			savedData = autofillStore.get( this.options.key ) || {}
	}

	function applyChange({ value, name, pattern }){
		// Edit the form state
		self.set( name, value )
		self.formError[ name ] = false
		
		// Test the validation pattern
		if( pattern && !self.Patterns.test( pattern, value ) ){
			self.formError[ name ] = true
			fireEvent( 'error', [ name, value ] )
		}

		// Apply changes
		self.component.setStateDirty( 'formError', self.formError )
	}

	function definePattern({ name, regexp }){

		if( !name || !regexp )
			throw new Error('Invalid Pattern Defined. { <name>, <regexp> } expected')

		// Remove regular expression closures "/"
		regexp = String( regexp ).replace(/^\/|\/$/g, '')
		try { new RegExp( regexp ) }
		catch( error ){ throw new Error('Invalid Regular Expression: ', error ) }

		// Add this to patterns bucket
		self.Patterns.add( name, regexp )

		return name
	}

	function autoSave(){
		if( !self.options.key || !self.options.autosave ) return
		
		autofillStore.set( self.options.key, self.form )
		fireEvent( 'autosave', [ self.form ] )
	}

	function autoClear(){
		if( !self.options.key ) return
		autofillStore.clear( self.options.key )
	}

	function fireEvent( name, args ){
		if( !Events.hasOwnProperty( name ) ) return
		Events[ name ].map( fn => Array.isArray( args ) ? fn( ...args ) : fn() )
	}

	this.form = {}
	this.initForm = {}
	this.formError = {}
	this.formPatterns = {}
	this.Patterns = new Patterns()

  /*------------------------------------------------------------------------*/
	// Bind this form to the container component
	this.bind = ( component, initForm ) => {

		// Binding component
		this.component = component
		// Initial form data or schema
		this.initForm = initForm || {}
		// populate auto-saved data with initial form data
		this.form = Object.assign( {}, this.initForm, savedData )
		// Set form initial states
		component.setState({ form: this.form, formError: this.formError })

		// Prevent this form from doing the default browser submission
		if( this.options.key ){
			let eForm

			component
			.on( 'mount', () => {
				if( eForm = component.getEl( this.options.key ) )
				eForm.onsubmit = e => e.preventDefault()
			} )
			.on( 'update', () => {
				/* In case the component mount without the form,
				check at any update whether the form is rendered
				in case it's being manipulated with MarkoJS
				conditional component <if><else>
				*/
				if( eForm ) return
				if( eForm = component.getEl( this.options.key ) )
				eForm.onsubmit = e => e.preventDefault()
			} )
		}

		// Assignable listeners to form's inputs
		component.__onInput = ( ...args ) => applyChange( getAttributes( args, 'input' ) )
		component.__onChange = ( ...args ) => applyChange( getAttributes( args, 'change' ) )
		component.__onSelect = ( ...args ) => applyChange( getAttributes( args, 'select' ) )
		component.__onChecked = ( ...args ) => applyChange( getAttributes( args, 'checked' ) )

		fireEvent('bind')
		return this
	}

	// Unbind this form from the container component
	this.unbind = component => {

	component = component || this.component

	delete component.form
	delete component.formError

	delete component.__onInput
	delete component.__onChange
	delete component.__onSelect
	delete component.__onChecked

	fireEvent('unbind')
	return this
	}

  /*------------------------------------------------------------------------*/
	// Set a field to the form
	this.set = ( name, data ) => {
		
    	/\./.test( name ) ?
				subSet( this.form, name, data ) // Deep set
				: this.form[ name ] = data // shalow set

		this.component.setStateDirty( 'form', this.form )
		fireEvent( 'input', [ name, data ] )

		// Form auto-saving activated
		if( this.options.autosave && autofillStore ) autoSave()

		return this
	}

	// Input data to fill the form
	this.fill = data => {

	    if( typeof data !== 'object' ) return
		this.component.setStateDirty( 'form', Object.assign( this.form, data ) )
		fireEvent( 'fill', [ this.form ] )

		// Form auto-saving activated
		if( this.options.autosave && autofillStore ) autoSave()

      	return this
	}

	// Set a field to the formError
	this.error = ( name, message ) => {

    	this.formError[ name ] = message
		this.component.setStateDirty( 'formError', this.formError )
    	fireEvent( 'error', [ name, message ] )

    	return this
	}

	// Manually reset the form
	this.reset = () => {

		this.form = {}
		this.formError = {}

		// Set form initial states
		this.component.setState({ form: this.initForm, formError: this.formError })
		// Clear existing form auto-save data
		autofillStore && autoClear()

		fireEvent('reset')
		return this
	}

	// Push thrown form alert message to state to be display
	this.alert = ( message, type ) => {

	    if( !message ) return
		this.component.setStateDirty( 'alert', { type: type || 'info', message })

	    const autoDismiss = setTimeout( () => {
			this.component.setState( 'alert', null )
			clearTimeout( autoDismiss )
	    }, 15000 )

    	return this
	}

  /*------------------------------------------------------------------------*/
	// Define form & inputs validation patterns
	this.define = arg => {

		// Defined existing validation pattern
		if( typeof arg == 'string' ){
			// Check declared pattern
			arg.split(/\s+|\|/)
				.map( each => {
					const pattern = each.replace(/:(.+)$/, '')

					if( !this.Patterns.has( pattern ) )
						throw new Error( '<'+ each +'> is not a Predefined Validation Patterm')
				} )

			return arg
		}

		/*----------------------------------------------------------------------*/
		// Custom validate patterns
		let nameSet = []

		// Array of custom validate patterns: Eg. [{ name: 'custom1', regexp: '/\.+/' }, { name: 'custom2', regexp: '/\w+/' }]
		if( Array.isArray( arg ) )
			arg.map( each => nameSet.push( definePattern( each ) ) )

		/*----------------------------------------------------------------------*/
		// Object or single custom validate pattern: Eg. { name: 'custom', regexp: '/\.+/' }
		else if( typeof arg == 'object' )
			nameSet.push( definePattern( arg ) )

		// Return the concatenated name of defined patterns
		return nameSet.join(' ')
	}

	// Manual validation or pattern
	this.validate = ( pattern, value ) => {
		return this.Patterns.test( pattern, value )
	}

	/*------------------------------------------------------------------------*/
	// Declare event listeners
	this.on = ( _event, fn ) => {
	// bounce unknow events
	if( !PEvents.includes( _event ) ) return

	// Register the listener
	!Events.hasOwnProperty( _event ) ?
						Events[ _event ] = [ fn ] // first listener
						: Events[ _event ].push( fn ) // additional listener
	return this
	}

	// Remove an event listeners
	this.off = _event => {
	delete Events[ _event ]
	return this
	}

	// Remove all event listeners
	this.removeListeners = () => {
	Events = {}
	return this
	}
}

export default FormHandler
