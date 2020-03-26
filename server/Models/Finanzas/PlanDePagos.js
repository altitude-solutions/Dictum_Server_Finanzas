/**
 *
 * @title:             Planes de pago
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Planes de pago Models, Plan de pagos y cuotas
 *
 **/

const { Model, DataTypes } = require('sequelize');
const { sql } = require('../../config/sql');

// ===============================================
// External models
// ===============================================
const { EmpresaGrupo, EntidadFinanciera } = require('./General');
const { LineasDeCredito } = require('./LineasDeCredito');

// ===============================================
// Plan de pagos model
// ===============================================
class PlanDePagos extends Model { };
PlanDePagos.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    tipoOperacion: {
        type: DataTypes.STRING
    },
    numeroDeContratoOperacion: {
        type: DataTypes.STRING
    },
    fechaFirma: {
        type: DataTypes.BIGINT
    },
    concepto: {
        type: DataTypes.STRING(1023)
    },
    detalle: {
        type: DataTypes.STRING(1023)
    },
    moneda: {
        type: DataTypes.STRING
    },
    monto: {
        type: DataTypes.DECIMAL(23, 2)
    },
    iva: {
        type: DataTypes.DECIMAL(23, 2)
    },
    cuotaInicial: {
        type: DataTypes.DECIMAL(23, 2)
    },
    garantia: {
        type: DataTypes.DECIMAL(23, 2)
    },
    tipoDeTasa: {
        type: DataTypes.STRING
    },
    interesFijo: {
        type: DataTypes.DECIMAL(23, 2)
    },
    interesVariable: {
        type: DataTypes.DECIMAL(23, 2)
    },
    plazo: {
        type: DataTypes.INTEGER
    },
    frecuenciaDePagos: {
        type: DataTypes.STRING
    },
    fechaVencimiento: {
        type: DataTypes.BIGINT
    },
    fechaDesembolso_1: {
        type: DataTypes.BIGINT
    },
    montoDesembolso_1: {
        type: DataTypes.DECIMAL(23, 2)
    },
    fechaDesembolso_2: {
        type: DataTypes.BIGINT
    },
    montoDesembolso_2: {
        type: DataTypes.DECIMAL(23, 2)
    },
    fechaDesembolso_3: {
        type: DataTypes.BIGINT
    },
    montoDesembolso_3: {
        type: DataTypes.DECIMAL(23, 2)
    },
    fechaDesembolso_4: {
        type: DataTypes.BIGINT
    },
    montoDesembolso_4: {
        type: DataTypes.DECIMAL(23, 2)
    },
    fechaDesembolso_5: {
        type: DataTypes.BIGINT
    },
    montoDesembolso_5: {
        type: DataTypes.DECIMAL(23, 2)
    },
    fechaDesembolso_6: {
        type: DataTypes.BIGINT
    },
    montoDesembolso_6: {
        type: DataTypes.DECIMAL(23, 2)
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    timestamps: false,
    tableName: 'planes_de_pago',
    modelName: 'planes_de_pago'
});

PlanDePagos.belongsTo(LineasDeCredito, {
    foreignKey: 'lineaDeCredito'
});

PlanDePagos.belongsTo(EmpresaGrupo, {
    foreignKey: 'empresaGrupo'
});

PlanDePagos.belongsTo(EntidadFinanciera, {
    foreignKey: 'entidadFinanciera'
});


// ===============================================
// Cuota plan de pagos model
// ===============================================
class CuotaPlanDePagos extends Model { };
CuotaPlanDePagos.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    numeroDeCuota: {
        type: DataTypes.INTEGER
    },
    fechaDePago: {
        type: DataTypes.BIGINT
    },
    montoTotalDelPago: {
        type: DataTypes.DECIMAL(23, 2)
    },
    pagoDeCapital: {
        type: DataTypes.DECIMAL(23, 2)
    },
    pagoDeInteres: {
        type: DataTypes.DECIMAL(23, 2)
    },
    pagoDeIva: {
        type: DataTypes.DECIMAL(23, 2)
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    timestamps: false,
    tableName: 'cuotas_del_plan_de_pagos',
    modelName: 'cuotas_del_plan_de_pagos'
});

CuotaPlanDePagos.belongsTo(PlanDePagos, {
    foreignKey: 'parent'
});


// ===============================================
// Cuota efectiva model
// ===============================================
class CuotaEfectiva extends Model { };
CuotaEfectiva.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    numeroDeCuota: {
        type: DataTypes.INTEGER
    },
    fechaDePago: {
        type: DataTypes.BIGINT
    },
    montoTotalDelPago: {
        type: DataTypes.DECIMAL(23, 2)
    },
    pagoDeCapital: {
        type: DataTypes.DECIMAL(23, 2)
    },
    pagoDeInteres: {
        type: DataTypes.DECIMAL(23, 2)
    },
    pagoDeIva: {
        type: DataTypes.DECIMAL(23, 2)
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    timestamps: false,
    tableName: 'cuotas_efectivas',
    modelName: 'cuotas_efectivas'
});

CuotaEfectiva.belongsTo(PlanDePagos, {
    foreignKey: 'parent'
});



// ===============================================
// Export models
// ===============================================
module.exports = {
    PlanDePagos,
    CuotaPlanDePagos,
    CuotaEfectiva
};