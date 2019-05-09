"use strict"
let puppeteer = require("puppeteer")
let express = require("express")
let morgan = require("morgan")
let proxy = require("express-http-proxy")
let isbot = require("isbot")

let BACKEND = "http://backend"

let browserOpts = {
	executablePath: "/usr/bin/chromium-browser",
	headless: true,
	args: ["--disable-web-security"],
}

let ALLOWED_REQUEST_TYPES = ["document", "script", "xhr", "fetch"]

function shouldSSR(req) {
	if (req.query.ssr === "false") return false
	if (isbot(req.headers["user-agent"])) return true
	if (req.query.ssr != null) return true
	return false
}

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

	return async function handler(req, res, next) {
		if (shouldSSR(req)) {
			await page.goto(BACKEND + req.path)
			let html = await page.content()
			res.send(html)
		} else {
			next()
		}
	}
}

async function main() {
	let app = express()
	app.use(morgan("combined"))
	app.get("/", await ssr())
	app.use(proxy(BACKEND))
	app.listen(8000)
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
