const enforce = (fn, message) => {
  if (!fn())
    throw new Error(message)
}

module.exports = {
  enforce,
}
