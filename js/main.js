class ZeroApp extends ZeroApi {
    setSiteInfo(_siteInfo) {
        /* Set Zer0net summary details. */
        App.ziteAddress = _siteInfo.address
        App.zitePeers = _siteInfo.peers
        App.ziteSize = _siteInfo.settings.size
    }

    onOpen() {
        /* Call super. */
        super.onOpen()

        this.cmd('siteInfo', [], function (_siteInfo) {
            Zero.setSiteInfo(_siteInfo)
        })
    }

    onEvent(_event, _message) {
        if (_event === 'setSiteInfo') {
            this.setSiteInfo(_message.params)
        } else {
            this._log('Unknown event:', _event)
        }
    }

    // onMessage(e) {
    //     console.log('DEBUG onMessage', e)
    // }
}

/**
 * Vue Application Manager (Configuration)
 */
const vueAppManager = {
    el: '#app',
    data: () => ({
        /* ZeroApp / ZeroApi Manager */
        zero: null,

        /* App Summary */
        appTitle: 'TL;DR',
        appDesc: 'Eternal Posting Service',
        searchId: '',

        /* Post Summary */
        postTitle: '',
        postBody: '',

        /* Security */
        passphrase: '',

        /* Zite Summary */
        ziteAddress: 'n/a',
        zitePeers: 0,
        ziteSize: 0
    }),
    mounted: function () {
        /* Initialize application. */
        this._init()
    },
    computed: {
        provider() {
            if (window.ethereum) {
                return new ethers.providers
                    .Web3Provider(window.ethereum)
            }

            if (window.web3) {
                return new ethers.providers
                    .Web3Provider(window.web3.currentProvider)
            }

            throw new Error('Please use a web3-enabled browser.')
        }
    },
    methods: {
        _init () {
            /* Initialize new Zer0net app manager. */
            // NOTE Globally accessible (e.g. Zero.cmd(...))
            window.Zero = new ZeroApp()

            console.info('App.() & Zero.() have loaded successfully!')
        },
        update () {
            const markdown = marked($('#input').val())

            /* Update the markup holder. */
            $('#preview').html(markdown)
        },
        async find () {
            /* Initialize provider. */
            // const provider = ethers.getDefaultProvider()
            const provider = ethers.getDefaultProvider('ropsten')
            // const provider = new ethers.providers.Web3Provider(web3.currentProvider)

            /* Set contract address. */
            // const contractAddress = '0x68120110506DcC0c95f6ac991Bae9340aeCeEd73'
            const contractAddress = '0xa5366C3040AEA68493866322115fe510AF501e7F' // ROPSTEN

            /* Set contract ABI. */
            const abi = [{constant:false,inputs:[],name:"acceptOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_title",type:"string"},{name:"_body",type:"bytes"}],name:"savePost",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newSuccessor",type:"address"}],name:"setSuccessor",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_tokenAddress",type:"address"},{name:"_tokens",type:"uint256"}],name:"transferAnyERC20Token",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newOwner",type:"address"}],name:"transferOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{inputs:[],payable:false,stateMutability:"nonpayable",type:"constructor"},{payable:true,stateMutability:"payable",type:"fallback"},{anonymous:false,inputs:[{indexed:true,name:"postId",type:"bytes32"},{indexed:true,name:"owner",type:"address"},{indexed:false,name:"body",type:"bytes"}],name:"Posted",type:"event"},{anonymous:false,inputs:[{indexed:true,name:"_from",type:"address"},{indexed:true,name:"_to",type:"address"}],name:"OwnershipTransferred",type:"event"},{constant:true,inputs:[{name:"_owner",type:"address"},{name:"_title",type:"string"}],name:"calcPostId",outputs:[{name:"postId",type:"bytes32"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_postId",type:"bytes32"}],name:"getPost",outputs:[{name:"location",type:"address"},{name:"blockNum",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getPredecessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getRevision",outputs:[{name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getSuccessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"newOwner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"owner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_interfaceID",type:"bytes4"}],name:"supportsInterface",outputs:[{name:"",type:"bool"}],payable:false,stateMutability:"pure",type:"function"}]

            /* Initialize contract connection via Web3 Provider. */
            const contract = new ethers.Contract(contractAddress, abi, provider)

            // console.log('CONTRACT', contract)

            /* Request the current block number. */
            // const blockNumber = await provider.getBlockNumber()
            // const blockNumDisplay = numeral(blockNumber).format('0,0')
            // console.info(`Current Block Number [ ${blockNumDisplay} ]`)

            const owner = '0x399c0fA056E3cF7aeC4A9E0BDa47Ee014DE3a5F0'

            // TEMP FOR TESTING PURPOSES ONLY
            let postId = await contract.calcPostId(owner, this.postTitle)

            console.log('POST ID', postId)

            this.searchId = postId

            this.loadPost()
        },
        // async post2It () {
        //     console.log('Make new post via Metamask, using Web3')
        //
        //     /* Initialize blockchain provider. */
        //     let provider = null
        //
        //     /* Select (http) provider. */
        //     // if (process.env.NODE_ENV === 'production') {
        //     //     provider = 'https://mainnet.infura.io/v3/9c75462e9ef54ba3ae559cde271fcf0d'
        //     // } else {
        //     //     provider = 'https://ropsten.infura.io/v3/9c75462e9ef54ba3ae559cde271fcf0d'
        //     // }
        //     // provider = 'https://ropsten.infura.io/v3/9c75462e9ef54ba3ae559cde271fcf0d'
        //
        //     /* Initialize web3. */
        //     // const web3 = new Web3(new Web3.providers.HttpProvider(provider))
        //     const web3 = new Web3(window.ethereum)
        //
        //     await window.ethereum.enable()
        //
        //     const from = '0x399c0fA056E3cF7aeC4A9E0BDa47Ee014DE3a5F0'
        //
        //     /* Initialize gas price. */
        //     const gasPrice = '20000000000' // default gas price in wei, 20 gwei in this case
        //     // this.gasPrice = '5.5' * 1e9 // or get with web3.eth.gasPrice
        //
        //     /* Set contract address. */
        //     const contractAddress = '0xa5366C3040AEA68493866322115fe510AF501e7F'
        //
        //     /* Set contract ABI. */
        //     const abi = [{constant:false,inputs:[],name:"acceptOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_title",type:"string"},{name:"_body",type:"bytes"}],name:"savePost",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newSuccessor",type:"address"}],name:"setSuccessor",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_tokenAddress",type:"address"},{name:"_tokens",type:"uint256"}],name:"transferAnyERC20Token",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newOwner",type:"address"}],name:"transferOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{inputs:[],payable:false,stateMutability:"nonpayable",type:"constructor"},{payable:true,stateMutability:"payable",type:"fallback"},{anonymous:false,inputs:[{indexed:true,name:"postId",type:"bytes32"},{indexed:true,name:"owner",type:"address"},{indexed:false,name:"body",type:"bytes"}],name:"Posted",type:"event"},{anonymous:false,inputs:[{indexed:true,name:"_from",type:"address"},{indexed:true,name:"_to",type:"address"}],name:"OwnershipTransferred",type:"event"},{constant:true,inputs:[{name:"_owner",type:"address"},{name:"_title",type:"string"}],name:"calcPostId",outputs:[{name:"postId",type:"bytes32"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_postId",type:"bytes32"}],name:"getPost",outputs:[{name:"location",type:"address"},{name:"blockNum",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getPredecessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getRevision",outputs:[{name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getSuccessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"newOwner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"owner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_interfaceID",type:"bytes4"}],name:"supportsInterface",outputs:[{name:"",type:"bool"}],payable:false,stateMutability:"pure",type:"function"}]
        //
        //     /* Initilize abi. */
        //     // const abi = require('../../abi/zeroCache')
        //
        //     /* Initialize (transaction) options. */
        //     const options = {
        //         from,
        //         gasPrice
        //     }
        //
        //     /* Initialize contract. */
        //     const contract = new web3.eth.Contract(
        //         abi, contractAddress, options)
        //
        //     const DEFAULT_GAS = '200000'
        //
        //     let title = this.postTitle
        //     let body = this.postBody
        //
        //     // TODO Perform some verification
        //
        //     /* Build TL;DR package. */
        //     const tldrPkg = { title, body }
        //
        //     // console.log('TL;DR PACKAGE', tldrPkg)
        //
        //     let tldrString = JSON.stringify(tldrPkg)
        //
        //     // console.log('TL;DR STRING', testString)
        //
        //     let tldrBytes = '0x' + Buffer.from(tldrString).toString('hex')
        //
        //     // console.log('TL;DR BYTES', testBytes)
        //
        //     /* Build encoded ABI. */
        //     const data = contract.methods.savePost(
        //         title,
        //         tldrBytes
        //     ).encodeABI()
        //
        //     const rawTx = {
        //         from,
        //         to: contractAddress,
        //         gas: DEFAULT_GAS,
        //         gasPrice: web3.utils.toHex(gasPrice),
        //         data
        //     }
        //
        //     console.log('RAW TX', rawTx)
        //
        //     /* Generate signed transaction. */
        //     // const signed = await web3.eth.accounts
        //     //     .signTransaction(rawTx)
        //     //     .catch(_error => {
        //     //         console.error('ERROR:', _error)
        //     //     })
        //
        //     /* Send signed transaction (to network). */
        //     // const signedTx = web3.eth.sendSignedTransaction(signed.rawTransaction)
        //     const signedTx = web3.eth.sendTransaction(rawTx)
        //
        //     // NOTE: Why do we need to listen for 24 confirmations??
        //     signedTx.on('confirmation', (_confirmationNumber, _receipt) => {
        //         // console.log('confirmation: ' + _confirmationNumber)
        //         // if (receipt) console.log('CONFIRMATION RECEIPT', _receipt)
        //     })
        //
        //     signedTx.on('transactionHash', _txHash => {
        //         /* Set tx hash. */
        //         txHash = _txHash
        //
        //         console.log(`[ ${txHash} ] has been submitted.`)
        //     })
        //
        //     signedTx.on('receipt', async _receipt => {
        //         console.log('Reciept', _receipt)
        //
        //         console.log(`[ ${_receipt.transactionHash} ] has been added to [ block # ${_receipt.blockNumber} ]`)
        //     })
        //
        //     signedTx.on('error', async (_error) => {
        //         // console.error('ERROR:', _error)
        //         console.error('ERROR:', _error.message)
        //     })
        //
        // },
        async postIt () {
            console.log('Posting..')

            await ethereum.enable()

            const provider = new ethers.providers.Web3Provider(ethereum);

            const abi = [{constant:false,inputs:[],name:"acceptOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_title",type:"string"},{name:"_body",type:"bytes"}],name:"savePost",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newSuccessor",type:"address"}],name:"setSuccessor",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_tokenAddress",type:"address"},{name:"_tokens",type:"uint256"}],name:"transferAnyERC20Token",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newOwner",type:"address"}],name:"transferOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{inputs:[],payable:false,stateMutability:"nonpayable",type:"constructor"},{payable:true,stateMutability:"payable",type:"fallback"},{anonymous:false,inputs:[{indexed:true,name:"postId",type:"bytes32"},{indexed:true,name:"owner",type:"address"},{indexed:false,name:"body",type:"bytes"}],name:"Posted",type:"event"},{anonymous:false,inputs:[{indexed:true,name:"_from",type:"address"},{indexed:true,name:"_to",type:"address"}],name:"OwnershipTransferred",type:"event"},{constant:true,inputs:[{name:"_owner",type:"address"},{name:"_title",type:"string"}],name:"calcPostId",outputs:[{name:"postId",type:"bytes32"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_postId",type:"bytes32"}],name:"getPost",outputs:[{name:"location",type:"address"},{name:"blockNum",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getPredecessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getRevision",outputs:[{name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getSuccessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"newOwner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"owner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_interfaceID",type:"bytes4"}],name:"supportsInterface",outputs:[{name:"",type:"bool"}],payable:false,stateMutability:"pure",type:"function"}]

            // const contractAddress = '0x68120110506DcC0c95f6ac991Bae9340aeCeEd73'
            const contractAddress = '0xa5366C3040AEA68493866322115fe510AF501e7F' // ROPSTEN

            // There is only ever up to one account in MetaMask exposed
            const signer = provider.getSigner()

            const contract = new ethers.Contract(contractAddress, abi, signer)

            const title = this.postTitle
            const body = this.postBody

            /* Build package. */
            const pkg = { title, body }

            // -----------------

            console.log('Encrypting with passphrase:', this.passphrase)

            var encrypted = CryptoJS.AES.encrypt(JSON.stringify(pkg), this.passphrase)

            console.log('ENCRYPTED', encrypted)

            console.log('ENCRYPTED (string)', encrypted.toString())

            let encryptedBuffer = Buffer.from(encrypted.toString(), 'base64')

            console.log('ENCRYPTED (buffer)', encryptedBuffer)

            let encryptedBytes = '0x' + encryptedBuffer.toString('hex')

            console.log('ENCRYPTED (bytes)', encryptedBytes)

            // -----------------

            // Call the contract, getting bsack the transaction
            let tx = await contract.savePost(title, encryptedBytes)

            console.log('TX', tx)

            // /* Initialize provider. */
            // let provider = null
            // // const provider = ethers.getDefaultProvider('ropsten')
            // // const provider = new ethers.providers.Web3Provider(web3.currentProvider)
            //
            // if (window.ethereum) {
            //     window.web3 = new Web3(ethereum)
            //
            //     try {
            //         // Request account access if needed
            //         console.log('window.ethereum')
            //
            //         // ethereum.enable()
            //         await window.ethereum.enable()
            //     } catch (error) {
            //         // User denied account access...
            //     }
            // } else if (window.web3) { // Legacy dapp browsers...
            //     window.web3 = new Web3(web3.currentProvider)
            //
            //     console.log('window.currentProvider')
            //     // Acccounts always exposed
            // } else { // Non-dapp browsers...
            //     alert('Non-Ethereum browser detected.\nYou should consider trying MetaMask!')
            // }
            //
            // /* Validate web3 and set provider. */
            // if (window.web3) {
            //     await ethereum.enable()
            //
            //     provider = new ethers.providers
            //         .Web3Provider(window.ethereum)
            //
            //     // provider = new ethers.providers
            //     //     .Web3Provider(window.web3.currentProvider)
            //     //
            //     console.log('Ethers provider', provider)
            //     console.log('Ethers provider getSigner()', provider.getSigner())
            // }
            //
            // /* Set contract address. */
            // const contractAddress = '0xa5366C3040AEA68493866322115fe510AF501e7F'
            //
            // /* Set contract ABI. */
            // const abi = [{constant:false,inputs:[],name:"acceptOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_title",type:"string"},{name:"_body",type:"bytes"}],name:"savePost",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newSuccessor",type:"address"}],name:"setSuccessor",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_tokenAddress",type:"address"},{name:"_tokens",type:"uint256"}],name:"transferAnyERC20Token",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newOwner",type:"address"}],name:"transferOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{inputs:[],payable:false,stateMutability:"nonpayable",type:"constructor"},{payable:true,stateMutability:"payable",type:"fallback"},{anonymous:false,inputs:[{indexed:true,name:"postId",type:"bytes32"},{indexed:true,name:"owner",type:"address"},{indexed:false,name:"body",type:"bytes"}],name:"Posted",type:"event"},{anonymous:false,inputs:[{indexed:true,name:"_from",type:"address"},{indexed:true,name:"_to",type:"address"}],name:"OwnershipTransferred",type:"event"},{constant:true,inputs:[{name:"_owner",type:"address"},{name:"_title",type:"string"}],name:"calcPostId",outputs:[{name:"postId",type:"bytes32"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_postId",type:"bytes32"}],name:"getPost",outputs:[{name:"location",type:"address"},{name:"blockNum",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getPredecessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getRevision",outputs:[{name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getSuccessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"newOwner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"owner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_interfaceID",type:"bytes4"}],name:"supportsInterface",outputs:[{name:"",type:"bool"}],payable:false,stateMutability:"pure",type:"function"}]
            //
            // /* Initialize contract connection via Web3 Provider. */
            // // await ethereum.enable()
            // const signer = provider.getSigner()
            // console.log('SIGNER', signer)
            // const contract = new ethers.Contract(contractAddress, abi, signer)
            // // const contract = new ethers.Contract(contractAddress, abi, provider)
            //
            // // console.log('CONTRACT', contract)
            //
            // /* Request the current block number. */
            // const blockNumber = await provider.getBlockNumber()
            // const blockNumDisplay = numeral(blockNumber).format('0,0')
            // console.info(`Current Block Number [ ${blockNumDisplay} ]`)
            //
            // contract.connect()
            //
            // let tx = await contract.savePost('DApp first!', '0x888')
            //     .catch(_error => {
            //         console.error('SAVE ERROR:', _error)
            //     })
            //
            // console.log('Tx', tx)

        },
        async loadPost () {
            /* Clear post body. */
            this.postBody = ''

            /* Wait a moment to update. */
            setImmediate(() => {
                this.update()
            })

            const searchId = this.searchId

            if (searchId.slice(0, 2) !== '0x') {
                // throw new Error('Invalid search id')
                return console.error('Invalid search id')
            }

            if (searchId.length !== 66) {
                // throw new Error('Invalid search id length', searchId.length)
                return console.error('Invalid search id length', searchId.length)
            }

            /* Initialize provider. */
            // const provider = ethers.getDefaultProvider()
            const provider = ethers.getDefaultProvider('ropsten')
            // const provider = new ethers.providers.Web3Provider(web3.currentProvider)

            /* Set contract address. */
            // const contractAddress = '0x68120110506DcC0c95f6ac991Bae9340aeCeEd73'
            const contractAddress = '0xa5366C3040AEA68493866322115fe510AF501e7F' // ROPSTEN

            /* Set contract ABI. */
            const abi = [{constant:false,inputs:[],name:"acceptOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_title",type:"string"},{name:"_body",type:"bytes"}],name:"savePost",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newSuccessor",type:"address"}],name:"setSuccessor",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_tokenAddress",type:"address"},{name:"_tokens",type:"uint256"}],name:"transferAnyERC20Token",outputs:[{name:"success",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{name:"_newOwner",type:"address"}],name:"transferOwnership",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{inputs:[],payable:false,stateMutability:"nonpayable",type:"constructor"},{payable:true,stateMutability:"payable",type:"fallback"},{anonymous:false,inputs:[{indexed:true,name:"postId",type:"bytes32"},{indexed:true,name:"owner",type:"address"},{indexed:false,name:"body",type:"bytes"}],name:"Posted",type:"event"},{anonymous:false,inputs:[{indexed:true,name:"_from",type:"address"},{indexed:true,name:"_to",type:"address"}],name:"OwnershipTransferred",type:"event"},{constant:true,inputs:[{name:"_owner",type:"address"},{name:"_title",type:"string"}],name:"calcPostId",outputs:[{name:"postId",type:"bytes32"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_postId",type:"bytes32"}],name:"getPost",outputs:[{name:"location",type:"address"},{name:"blockNum",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getPredecessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getRevision",outputs:[{name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getSuccessor",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"newOwner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"owner",outputs:[{name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[{name:"_interfaceID",type:"bytes4"}],name:"supportsInterface",outputs:[{name:"",type:"bool"}],payable:false,stateMutability:"pure",type:"function"}]

            /* Initialize contract connection via Web3 Provider. */
            const contract = new ethers.Contract(contractAddress, abi, provider)

            // console.log('CONTRACT', contract)

            /* Request the current block number. */
            const blockNumber = await provider.getBlockNumber()
            const blockNumDisplay = numeral(blockNumber).format('0,0')
            console.info(`Current Block Number [ ${blockNumDisplay} ]`)

            // TEMP FOR TESTING PURPOSES ONLY
            let postData = await contract.getPost(searchId)

            console.log('GET POST', postData)

            const blockNum = postData.blockNum
            const location = postData.location

            /* Validate location. */
            if (location === '0x0000000000000000000000000000000000000000') {
                console.log('New entry in progress..')
            } else {
                console.log('blockNum / location', blockNum.toString(), location)

                /* Set event log topic. */
                const topic = ethers.utils.id('Posted(bytes32,address,bytes)')

                /* Set event log filter. */
                const filter = {
                    address: contractAddress,
                    topics: [ topic ]
                }

                /* Reset to event block. */
                provider.resetEventsBlock(blockNum - 1)

                /* Listening for ONE event. */
                provider.once(filter, (_result) => {
                    // console.info('Log results', _result)

                    /* Parse the log details. */
                    const parsed = contract.interface.parseLog(_result)

                    console.info('Parsed log results', parsed)

                    /* Set post id. */
                    const postId = parsed['values']['postId']

                    /* Set owner. */
                    const owner = parsed['values']['owner']

                    /* Set body. */
                    let body = parsed['values']['body']

                    try {
                        let backToString = Buffer.from(body.slice(2), 'hex').toString('base64')

                        console.log('BACKTOSTRING', backToString)

                        var decrypted = CryptoJS.AES.decrypt(backToString, this.passphrase)

                        console.log('DECRYPTED', decrypted)

                        let decryptedString = decrypted.toString(CryptoJS.enc.Utf8)

                        console.log('DECRYPTED (string)', decryptedString)

                        body = JSON.parse(decryptedString)

                        console.log('DECRYPTED (JSON)', body)

                        /* Parse bytes. */
                        // body = Buffer.from(body.slice(2), 'hex').toString()

                        /* Parse info. */
                        // body = JSON.parse(body)

                        /* Format parsed data. */
                        const data = { postId, owner, body }

                        console.info('Post data', data)

                        // this.postTitle = body.title

                        /* Set post body. */
                        this.postBody = body.body

                        /* Wait a moment to update. */
                        setImmediate(() => {
                            this.update()
                        })

                        /* Add data to TOP of list. */
                        // this.events.unshift(data)
                    } catch (_err) {
                        console.error('ERROR parsing info', _err, body)

                        // console.error('_err.message', _err.message)

                        if (
                            _err.message === 'Malformed UTF-8 data' ||
                            _err.message === 'Unexpected end of JSON input'
                        ) {
                            alert('Decryption failed! Please check your passphrase..')
                        }
                    }
                })
            }
        }
    }
}

/* Initialize the Vue app manager. */
const App = new Vue(vueAppManager)
