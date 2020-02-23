function hotp(key, counter) {
    function SHA1(message) {
        var m  = [], w  = [], r  = new String(), l  = message.length * 8, H  = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
        for (var c = 0, l = 0; c < message.length; c++, l += 8)
            m[l >>> 5] |= message.charCodeAt(c) << (24 - l % 32);
        m[l >> 5] |= 0x80 << (24 - l % 32), m[((l + 64 >>> 9) << 4) + 15] = l;
        for (var i = 0; i < m.length; i += 16) {
            var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4];
            for (var j = 0; j < 80; j++) {
                if (j < 16)  w[j] = m[i + j];
                else {
                    var n = w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16];
                    w[j] = (n << 1) | (n >>> 31);
                }
                var t = ((a << 5) | (a >>> 27)) + e + (w[j] >>> 0) + (
                         j < 20 ? (b & c | ~b & d) + 0x5A827999 : j < 40 ? (b ^ c ^ d) + 0x6ED9EBA1 :
                         j < 60 ? (b & c | b & d | c & d) + 0x8F1BBCDC : (b ^ c ^ d) + 0xCA62C1D6);
                e =  d, d = c, c = (b << 30) | (b >>> 2), b =  a, a =  t;
            }
            H[0] += a, H[1] += b, H[2] += c, H[3] += d, H[4] += e;
        }
		for (var b = 0; b < 20; b += 1) r += (String.fromCharCode((H[b >>> 2] >>> ((3 - b % 4) << 3)) & 0xFF));
		return r;
    };
    function HMAC_SHA1(message, key) {
        key = key.length > 64 ? SHA1(key) : key.padEnd(64, '\0');
        var okey = new String(), ikey = new String();
        for (var i = 0; i < 64; i++)
            okey += String.fromCharCode(key.charCodeAt(i) ^ 0x5C), ikey += String.fromCharCode(key.charCodeAt(i) ^ 0x36);
        var hmacbytes = SHA1(okey + SHA1(ikey + message));
        return hmacbytes;
    };
    function formatCounter(counter) {
        var hex = parseInt(counter).toString(16).padStart(16, '0'), str = new String();
        for(var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }
    function truncate(h) {
        offset = h.charCodeAt(19) & 0xF;
        return ((h.charCodeAt(offset++) & 0x7F) << 24 
               | h.charCodeAt(offset++) << 16 
               | h.charCodeAt(offset++) << 8 
               | h.charCodeAt(offset++)).toString().slice(-6);
    }
    return truncate(HMAC_SHA1(formatCounter(counter), key));
}