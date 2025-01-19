# Use Bitnami's Postgres 17 image as the base
FROM bitnami/postgresql:17

# Optional: who maintains this image
LABEL maintainer="BiasBinder Team"

# Copy your SQL scripts into the directory that Postgres checks on first run
# Rename or prefix them with numbers so they run in the desired order
COPY ./Phase_3_script_creation_table/init.sql                 /docker-entrypoint-initdb.d/1_init.sql
COPY ./Phase_4_data_views_triggers/triggers.sql              /docker-entrypoint-initdb.d/2_triggers.sql
COPY ./Phase_4_data_views_triggers/views.sql                 /docker-entrypoint-initdb.d/3_views.sql
COPY ./Phase_4_data_views_triggers/Data_Import/Insert_group_ATZ.sql /docker-entrypoint-initdb.d/4_insert_group_ATZ.sql
COPY ./Phase_4_data_views_triggers/Data_Import/Insert_group_BLP.sql /docker-entrypoint-initdb.d/5_insert_group_BLP.sql

# Optional defaults for local dev/teaching
ENV POSTGRESQL_USERNAME=biasbinder_dev
ENV POSTGRESQL_PASSWORD=biasbinder
ENV POSTGRESQL_DATABASE=biasbinder_db
ENV POSTGRESQL_POSTGRES_PASSWORD=root

# Expose Postgres port (so you can connect from outside containers)
EXPOSE 5432

# The parent image (bitnami/postgresql:17) already defines its ENTRYPOINT
# so you usually don't need to override it here. That entrypoint will:
# 1) Initialize a new database if none exists
# 2) Run *.sql files found in /docker-entrypoint-initdb.d/
# 3) Start the Postgres server
