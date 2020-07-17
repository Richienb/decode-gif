const test = require("ava")
const { promises: fs } = require("fs")
const decodeGif = require(".")

test("main", async t => {
	t.snapshot(decodeGif(await fs.readFile("fixtures/unicorn.gif")))
	t.snapshot(decodeGif(await fs.readFile("fixtures/still-unicorn.gif")))
})
