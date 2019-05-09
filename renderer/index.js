"use strict"
let puppeteer = require("puppeteer")
let express = require("express")
let morgan = require("morgan")

let BACKEND = "http://backend"
let PORT = 8000

let browserOpts = {
	executablePath: "/usr/bin/chromium-browser",
	headless: true,
	args: ["--disable-web-security"],
}

let ALLOWED_REQUEST_TYPES = ["document", "script", "xhr", "fetch"]

async function ssr() {
	let browser = await puppeteer.launch(browserOpts)
	let page = await browser.newPage()

	await page.setRequestInterception(true)

	page.on("request", req => {
		if (ALLOWED_REQUEST_TYPES.includes(req.resourceType())) {
			req.continue()
		} else {
			req.abort()
		}
	})

	return async function handler(req, res) {
		await page.goto(BACKEND + req.path, { timeout: 5000 })
		let html = await page.content()
		res.send(html)
	}
}

async function main() {
	let app = express()
	app.use(morgan("combined"))
	app.get("*", await ssr())
	app.listen(PORT)
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
