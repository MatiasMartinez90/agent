import json
import logging
import os
import boto3
from botocore.exceptions import ClientError

# Configurar logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Handler para el post-confirmation trigger de Cognito - VERSION SIMPLE SIN PSYCOPG2
    """
    try:
        logger.info(f"🎯 PostConfirmation trigger ejecutado! Event: {json.dumps(event)}")
        
        # Extraer información del usuario
        user_attributes = event['request']['userAttributes']
        username = event['userName']
        user_pool_id = event['userPoolId']
        trigger_source = event['triggerSource']
        
        email = user_attributes.get('email', 'No email')
        name = user_attributes.get('name', 'No name')
        
        logger.info(f"👤 Usuario registrado:")
        logger.info(f"   - Username: {username}")
        logger.info(f"   - Email: {email}")
        logger.info(f"   - Name: {name}")
        logger.info(f"   - User Pool: {user_pool_id}")
        logger.info(f"   - Trigger Source: {trigger_source}")
        
        # TODO: Aquí iría la conexión a PostgreSQL una vez que resolvamos psycopg2
        logger.info("✅ PostConfirmation completado exitosamente (sin DB por ahora)")
        
        return event
        
    except Exception as e:
        logger.error(f"❌ Error en PostConfirmation: {str(e)}")
        logger.error(f"❌ Event completo: {json.dumps(event)}")
        
        # No fallar el login, solo logear el error
        return event