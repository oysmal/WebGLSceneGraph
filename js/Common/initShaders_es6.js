function getShaderES6(gl, shaderName, type, next) {

    return new Promise((res, rej) => {
        let pre = '/';

        // only works in firefox / safari. Not chrome because of cors
        if(document.location.protocol === 'file:') {
            pre = (document.location + "").replace(/\w+.html$/, "");
        }
        fetch(pre + shaderName,
            {
                method: 'get',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain'
                }
            }).then((response) => {
                response.text().then((txt) => res(txt));
            }).catch((err) => {
                rej(err);
            });
    });


}

function initShadersES6(gl, vShaderName, fShaderName) {

    return new Promise((resolve, reject) => {

        getShaderES6(gl, vShaderName, gl.VERTEX_SHADER).then((vShaderTxt) => {

            let vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vShaderTxt);
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(vertexShader));
                reject("err");
            }

            getShaderES6(gl, fShaderName, gl.FRAGMENT_SHADER).then((fShaderTxt) => {
                let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(fragmentShader, fShaderTxt);
                gl.compileShader(fragmentShader);
                if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                    alert(gl.getShaderInfoLog(fragmentShader));
                    reject("err");
                }

                let program = gl.createProgram();

                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);

                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    alert("Could not initialise shaders");
                    reject("Could not initialise shaders");
                }

                resolve(program);

            });
        });
    });

};

