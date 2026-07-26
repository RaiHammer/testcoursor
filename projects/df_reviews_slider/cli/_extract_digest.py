text = open("_big_script.js", encoding="utf-8").read()
i = text.find("Digest: objectId is undefined")
chunk = text[i : i + 3000]
open("_digest_payload.txt", "w", encoding="utf-8").write(chunk)
print("written", len(chunk))
