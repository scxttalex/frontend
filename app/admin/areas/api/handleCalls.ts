'use client'
export const postUpload = async (options: any) => {

    console.log(options)

    const response = await fetch("http://localhost:8080/s3/upload", options)

    const data = await response.text()

    return data;
}

// export const postNewArea = async (options: any) => {
//     console.log(options)
//     await fetch("http://localhost:8080/areas", options)
// }