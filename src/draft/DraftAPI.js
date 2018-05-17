export const uploadImage = (image) => {
    const body = new FormData();
    body.append('temp[file][data]', image);

    return fetch('http://localhost:3000/temps', {
        method: 'post',
        body,
    })
        .then(res => res.json())
        .then(payload => ({ payload }))
        .catch(error => ({ error }));
};

export const deleteImage = id =>
    fetch(`http://localhost:3000/temps/${id}`, { method: 'delete' })
        .then(res => res.json())
        .then(payload => ({ payload }))
        .catch(error => ({ error }));

export const deleteImages = (ids) => {
    const body = new FormData();
    body.append('temp[ids]', ids);

    return fetch('http://localhost:3000/temps/truncate', {
        method: 'post',
        body,
    })
        .then(res => res.json())
        .then(payload => ({ payload }))
        .catch(error => ({ error }));
};

export const post = (value = '', ids = []) => {
    const body = new FormData();
    body.append('content[value]', value);
    body.append('temp[ids]', ids);

    console.log(body);

    return fetch('http://localhost:3000/contents', {
        method: 'post',
        body,
    })
        .then(res => res.json())
        .then(payload => ({ payload }))
        .catch(error => ({ error }));
};

export default { post, uploadImage, deleteImage, deleteImages };
