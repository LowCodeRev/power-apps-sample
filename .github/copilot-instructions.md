# Power SDK Instructions Start
## Overview

This guide explains how to initialize an app, add a data source using the Power SDK CLI and generate the corresponding Models and Services, and publish the app.

**Always continue immediately** without asking for confirmation at each step.

## CLI Command

Use the following command to initialize an app:

```bash
pac code init -n <app name> -env <environmentId>
```

**Example:**

```bash
pac code init -n "Asset Tracker" -env "<your-environment-id>"
```

Use the following command to add a data source:

```bash
pac code add-data-source -a <apiId> -c <connectionId>
```

**Example:**

```bash
pac code add-data-source -a "shared_office365users" -c "<your-connection-id>"
```

If additional parameters such as table and dataset are required, use:

```bash
pac code add-data-source -a <apiId> -c <connectionId> -t <tableName> -d <datasetName>
```

**Example:**

```bash
pac code add-data-source -a "shared_sql" -c "<your-connection-id>" -t "[dbo].[YourTable]" -d "<your-sql-server>.database.windows.net,<your-database>"
```

Use the following command to publish an app:

```bash
npm run build
pac code push
```

**Example:**

```bash
pac code push
```

## Using Model and Service

- Read the files under src\Models and src\Services folder for data binding.
- Read the files under .power\schemas folder for other schema reference.
# Power SDK Instructions End