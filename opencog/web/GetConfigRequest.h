/*
 *
 * Copyright (C) 2010 by Singularity Institute for Artificial Intelligence
 * Copyright (C) 2010 by Joel Pitt
 * All Rights Reserved
 *
 * Written by Joel Pitt <joel@fruitionnz.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License v3 as
 * published by the Free Software Foundation and including the exceptions
 * at http://opencog.org/wiki/Licenses
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program; if not, write to:
 * Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

#ifndef _OPENCOG_GET_CONFIG_REQUEST_H
#define _OPENCOG_GET_CONFIG_REQUEST_H

#include <sstream>
#include <string>
#include <vector>

#include <opencog/atomspace/types.h>
#include <opencog/server/Request.h>

namespace opencog
{

class GetConfigRequest : public Request
{

protected:
    enum { json_format, html_tabular_format } output_format;

    std::ostringstream  _output;


public:

    static inline const RequestClassInfo& info() {
        static const RequestClassInfo _cci(
            "json-get-config",
            "Get config details on opencog",
            "Usage: json-get-config\n\n"
            "Get details for a particular atom referred by handle\n",
            false, true // not shell, is hidden
        );
        return _cci;
    }

    GetConfigRequest();
    virtual ~GetConfigRequest();
    virtual bool execute(void);
    virtual bool isShell(void) {return info().is_shell;}

    void html_makeOutput();

    void json_makeOutput();

    void sendError(std::string s);

    //std::string getHTML(std::string);
};


} // namespace

#endif // _OPENCOG_Config_REQUEST_H
