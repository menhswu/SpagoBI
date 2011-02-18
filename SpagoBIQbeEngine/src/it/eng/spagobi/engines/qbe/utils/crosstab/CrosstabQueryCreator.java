/**

SpagoBI - The Business Intelligence Free Platform

Copyright (C) 2005-2009 Engineering Ingegneria Informatica S.p.A.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

**/
package it.eng.spagobi.engines.qbe.utils.crosstab;

import it.eng.qbe.crosstab.bo.CrosstabDefinition;
import it.eng.qbe.query.ISelectField;
import it.eng.qbe.query.Query;
import it.eng.spagobi.tools.dataset.common.query.AggregationFunctions;
import it.eng.spagobi.tools.dataset.common.query.IAggregationFunction;
import it.eng.spagobi.utilities.sql.SqlUtils;

import java.util.Iterator;
import java.util.List;

import org.apache.log4j.Logger;


/**
 * Creates the crosstab query 
 * 
 * @author Davide Zerbetto (davide.zerbetto@eng.it)
 *
 */
public class CrosstabQueryCreator {

	/** Logger component. */
    public static transient Logger logger = Logger.getLogger(CrosstabQueryCreator.class);
	
    public static final String QBE_SMARTFILTER_COUNT = "qbe_smartfilter_count"; 
    
	public static String getCrosstabQuery(CrosstabDefinition crosstabDefinition, Query baseQuery, String sqlQuery) {
		logger.debug("IN");
		StringBuffer buffer = new StringBuffer();
		
		List baseQuerySelectedFields = SqlUtils.getSelectFields(sqlQuery);
		
		putSelectClause(buffer, crosstabDefinition, baseQuery, baseQuerySelectedFields);
		
		buffer.append(" FROM TEMPORARY_TABLE ");
		
		putGroupByClause(buffer, crosstabDefinition, baseQuery, baseQuerySelectedFields);
		
		String toReturn = buffer.toString();
		logger.debug("OUT: returning " + toReturn);
		return toReturn;
	}
	
	private static void putSelectClause(StringBuffer toReturn,
			CrosstabDefinition crosstabDefinition, Query baseQuery, List baseQuerySelectedFields) {
		logger.debug("IN");
		List<CrosstabDefinition.Row> rows = crosstabDefinition.getRows();
		List<CrosstabDefinition.Column> colums = crosstabDefinition.getColumns();
		List<CrosstabDefinition.Measure> measures = crosstabDefinition.getMeasures(); 
		
		toReturn.append("SELECT ");
		
		// appends columns
		Iterator<CrosstabDefinition.Column> columsIt = colums.iterator();
		while (columsIt.hasNext()) {
			CrosstabDefinition.Column aColumn = columsIt.next();
			String alias = getSQLAlias(aColumn, baseQuery, baseQuerySelectedFields);
			toReturn.append(alias);
			toReturn.append(", ");
		}
		// appends rows
		Iterator<CrosstabDefinition.Row> rowsIt = rows.iterator();
		while (rowsIt.hasNext()) {
			CrosstabDefinition.Row aRow = rowsIt.next();
			String alias = getSQLAlias(aRow, baseQuery, baseQuerySelectedFields);
			toReturn.append(alias);
			toReturn.append(", ");
		}
		
		// appends measures
		Iterator<CrosstabDefinition.Measure> measuresIt = measures.iterator();
		while (measuresIt.hasNext()) {
			CrosstabDefinition.Measure aMeasure = measuresIt.next();
			IAggregationFunction function = aMeasure.getAggregationFunction();
			String alias = getSQLAlias(aMeasure, baseQuery, baseQuerySelectedFields);
			if (alias == null) {
				if (aMeasure.getEntityId().equals(QBE_SMARTFILTER_COUNT)) {
					toReturn.append(AggregationFunctions.COUNT_FUNCTION.apply("*"));
				} else {
					logger.error("Alias " + aMeasure.getAlias() + " not found on the base query!!!!");
					throw new RuntimeException("Alias " + aMeasure.getAlias() + " not found on the base query!!!!");
				}
			} else {
				if (function != AggregationFunctions.NONE_FUNCTION) {
					toReturn.append(function.apply(alias));
				} else {
					toReturn.append(alias);
				}
			}
			if (measuresIt.hasNext()) {
				toReturn.append(", ");
			}
		}

		logger.debug("OUT");
	}
	
	private static void putGroupByClause(StringBuffer toReturn,
			CrosstabDefinition crosstabDefinition, Query baseQuery, List baseQuerySelectedFields) {
		logger.debug("IN");
		List<CrosstabDefinition.Row> rows = crosstabDefinition.getRows();
		List<CrosstabDefinition.Column> colums = crosstabDefinition.getColumns();
		
		toReturn.append(" GROUP BY ");
		
		// appends columns
		Iterator<CrosstabDefinition.Column> columsIt = colums.iterator();
		while (columsIt.hasNext()) {
			CrosstabDefinition.Column aColumn = columsIt.next();
			String alias = getSQLAlias(aColumn, baseQuery, baseQuerySelectedFields);
			toReturn.append(alias);
			if (columsIt.hasNext()) {
				toReturn.append(", ");
			}
		}
		
		// append an extra comma between grouping on columns and grouping on rows, if necessary
		if (colums.size() > 0 && rows.size() > 0) {
			toReturn.append(", ");
		}
		
		// appends rows
		Iterator<CrosstabDefinition.Row> rowsIt = rows.iterator();
		while (rowsIt.hasNext()) {
			CrosstabDefinition.Row aRow = rowsIt.next();
			String alias = getSQLAlias(aRow, baseQuery, baseQuerySelectedFields);
			toReturn.append(alias);
			if (rowsIt.hasNext()) {
				toReturn.append(", ");
			}
		}
		logger.debug("OUT");
		
	}
	
	private static String getSQLAlias(CrosstabDefinition.CrosstabElement element, Query baseQuery, List baseQuerySelectedFields) {
		logger.debug("IN");
		String toReturn = null;
		
		List qbeQueryFields = baseQuery.getSelectFields(true);
		int index = -1;
		for (int i = 0; i < qbeQueryFields.size(); i++) {
			ISelectField field = (ISelectField) qbeQueryFields.get(i);
			if (field.getAlias().equals(element.getAlias())) {
				index = i;
				break;
			}
		}
		
		if (index > -1) {
			String[] sqlField = (String[]) baseQuerySelectedFields.get(index);
			toReturn = sqlField[1] != null ? sqlField[1] : sqlField[0];
		}
		
		logger.debug("OUT: returning " + toReturn);
		return toReturn;
	}

}
