module.exports = (sequelize, DataTypes) => {
    const Nivel = sequelize.define('niveltables', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        nivel: {
            type: DataTypes.FLOAT,
            required: true
        }
    });

    Nivel.associate = models => {
        Nivel.belongsTo(models.User);
    };

    return Nivel;
}