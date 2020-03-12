/**
 *
 * @title:             Permissions
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       This code handles permissions format from and string to array and viceversa
 *
 **/


let permisosValidos = [
    'es_leer', 'es_escribir', 'es_borrar', 'es_modificar', // estación de servicio
    'or_leer', 'or_escribir', 'or_borrar', 'or_modificar', // operador de radio
    'u_leer', 'u_escribir', 'u_borrar', 'u_modificar', // usuarios
    'ru_leer', 'ru_escribir', 'ru_borrar', 'ru_modificar', // rutas
    'p_leer', 'p_escribir', 'p_borrar', 'p_modificar', // personal
    've_leer', 've_escribir', 've_borrar', 've_modificar', // vehículos
    'io_leer', 'io_escribir', 'io_borrar', 'io_modificar', // Operador base
    'fin_leer', 'fin_escribir', 'fin_borrar', 'fin_modificar', // Finanzas
    'pro_leer', 'pro_escribir', 'pro_borrar', 'pro_modificar' // Proyectos
];

let construirPermisos = (permi) => {
    permi = permi.replace(/ /g, '');
    let aux = [];
    let i = 0;
    let maxLen = permi.length;
    while (permi.length > 0) {
        let current = permi[maxLen - i - 1];
        permi = permi.slice(0, -1);
        // console.log(current);
        if (current == '1') {
            aux.push(permisosValidos[i]);
        }
        i++;
    }
    return aux;
};

let empaquetarPermisos = (permiArray) => {
    let aux = '';

    for (let i = 0; i < permisosValidos.length; i++) {
        if (permiArray.includes(permisosValidos[permisosValidos.length - i - 1])) {
            aux += '1';
        } else {
            aux += '0';
        }
        if ((i + 1) % 4 == 0) aux += ' ';
    }
    // Remove the las space
    aux = aux.substring(0, aux.length - 1);
    return aux;
};


module.exports = {
    construirPermisos,
    empaquetarPermisos
};