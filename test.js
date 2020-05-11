const test = require("ava")
const fs = require("fs")
const decodeGif = require(".")

test("main", t => {
	t.snapshot(decodeGif(fs.readFileSync("fixtures/unicorn.gif")))
	t.snapshot(decodeGif(fs.readFileSync("fixtures/still-unicorn.gif")))
})
