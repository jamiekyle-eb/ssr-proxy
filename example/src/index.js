import "@babel/polyfill"
import "./disable-speedy" // This has to be run before emotion inserts any styles so it's imported before the App component

import React from "react"
import { render, hydrate } from "react-dom"
import { App } from "./App"

let root = document.getElementById("root")

// Check if the root node has any children to detect if the app has been prerendered
if (root.hasChildNodes()) {
	hydrate(<App />, root)
} else {
	render(<App />, root)
}
